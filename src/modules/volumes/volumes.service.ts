import { Injectable } from '@nestjs/common';
import { SwapService } from '../swaps/swaps.service';
import { ChronoPriceService } from '../chrono-price/chrono-price.service';
import { TokenPriceService } from '../token-price/token-price.service';
import { TokenVolumeDto } from './dto/token-volume.dto';
import Big from 'big.js';
import { TokenVolume } from './entity/volumes.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { isNumberString } from 'class-validator';
import { TradingVolumesChartDto } from './dto/trading-volumes-chart.dto';
import { VOLUMES_HISTORY_QUERY } from './volumes.const';

const AVG_PRICE_MINUTE_LOOKBACK = 5;

@Injectable()
export class VolumesService {
  constructor(
    @InjectDataSource('pg')
    private readonly dataSource: DataSource,
    @InjectRepository(TokenVolume, 'pg')
    private readonly volumesRepo: Repository<TokenVolume>,
    private readonly swapService: SwapService,
    private readonly chronoPriceService: ChronoPriceService,
    private readonly tokenPriceService: TokenPriceService,
  ) {
    this.persistTokenVolumes();
  }

  public async getVolumesForChart(
    symbol: string,
    resolution: string,
    from: number,
    to: number,
    countback: number,
  ): Promise<TradingVolumesChartDto> {
    const params = this.buildQueryParams(
      symbol,
      resolution,
      from,
      to,
      countback,
    );

    const [tokenVolumes] = await this.dataSource.query(
      VOLUMES_HISTORY_QUERY,
      params,
    );

    return {
      t: tokenVolumes.t || [],
      v: tokenVolumes.v || [],
    };
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async persistTokenVolumes(): Promise<void> {
    const tokenVolumes = await this.calcTokenVolumes();

    await this.volumesRepo.insert(tokenVolumes);
  }

  private async calcTokenVolumes(): Promise<TokenVolumeDto[]> {
    const tokens = await this.tokenPriceService.findAll();
    const swaps = await this.swapService.findSwapsForVolumes();

    const tokenAndVolume = await Promise.all(
      tokens.map(async (token) => {
        const tokenSwaps = swaps.filter(
          (swap) =>
            swap.inputAssetId === token.assetId ||
            swap.outputAssetId === token.assetId,
        );

        const totalAmountSwapped = tokenSwaps.reduce((acc, swap) => {
          if (swap.inputAssetId === token.assetId) {
            return new Big(acc).add(swap.assetInputAmount).toNumber();
          }

          return new Big(acc).add(swap.assetOutputAmount).toNumber();
        }, 0);

        if (totalAmountSwapped === 0) {
          return {
            token: token.token,
            volume: 0,
          };
        }

        const avgTokenPrice =
          await this.chronoPriceService.getAvgTokenPriceForLastMinutes(
            token.token,
            AVG_PRICE_MINUTE_LOOKBACK,
          );

        return {
          token: token.token,
          volume: new Big(totalAmountSwapped).mul(avgTokenPrice).toNumber(),
        };
      }),
    );

    return tokenAndVolume;
  }

  private buildQueryParams(
    symbol: string,
    resolution: string,
    from: number,
    to: number,
    countback: number,
  ): string[] {
    return [
      this.resolveResolution(resolution),
      symbol,
      from.toString(),
      to.toString(),
      countback.toString(),
    ];
  }

  private resolveResolution(resolution: string): string {
    if (isNumberString(resolution)) {
      return `${resolution}m`;
    }

    return resolution;
  }
}
