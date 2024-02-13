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
// Interval on which the volume should be written in the DB
const INTERVAL = 5;

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
  ) {}

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
    const timePassed = await this.timePassedSinceLastVolume();
    // How many intervals have passed since last time volumes were written to the DB
    /*
      For example, if 19:20 and 19:25 were missed,
      time passed from 19:15(last time written to DB) to 19:30 is 15 minutes

      15 minutes / 5 is 3 intervals we need to make for (compensate);
      19:20, 19:25 and 19:30(regularly called cron) respectfuly
    */
    const intervals = timePassed / INTERVAL;

    // Write volumes for each interval missed.
    // Why this while-loop works descedently is explained in swaps.repository.ts
    let i = 0;
    while (i < intervals) {
      const tokenVolumes = await this.calcTokenVolumes(intervals - i);

      await this.volumesRepo.insert(tokenVolumes);

      i = i + 1;
    }
  }

  private async calcTokenVolumes(i: number): Promise<TokenVolumeDto[]> {
    const tokens = await this.tokenPriceService.findAll();
    const swaps = await this.swapService.findSwapsForVolumes(i);

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
            volumeAt: 5,
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
          volumeAt: 5,
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

  // Get last volume written in the DB
  private getLastVolume(): Promise<TokenVolume> {
    const lastVolume = this.volumesRepo
      .createQueryBuilder('volume')
      .orderBy('volume.createdAt', 'DESC')
      .getOne();

    return lastVolume;
  }

  // Calculate the time passed since the last volume update
  private async timePassedSinceLastVolume(): Promise<number> {
    // Get the current date and time
    const now = new Date();
    // Adjust the date and time to the Belgrade timezone (as done in DB)
    now.setHours(now.getHours() + 1);
    const lastVolume = await this.getLastVolume();
    // Turn time and date into the timestamp
    const lastVolumeTime = lastVolume.createdAt.getTime();
    // get the time passed between the current time and last time volume was written in the DB
    const timePassed = now.getTime() - lastVolumeTime;
    const timePassedMinutes = timePassed / (1000 * 60);

    return Math.round(timePassedMinutes);
  }
}
