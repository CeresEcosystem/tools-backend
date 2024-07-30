import { Injectable, Logger } from '@nestjs/common';
import { SwapService } from '../swaps/swaps.service';
import { ChronoPriceService } from '../chrono-price/chrono-price.service';
import { TokenPriceService } from '../token-price/token-price.service';
import Big from 'big.js';
import { TokenVolume } from './entity/volumes.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isNumberString } from 'class-validator';
import { TradingVolumesChartDto } from './dto/trading-volumes-chart.dto';
import {
  MINUTES_ELAPSED_SINCE_LAST_VOLUME_QUERY,
  VOLUMES_HISTORY_QUERY,
} from './volumes.const';
import { TokenVolumeDto } from './dto/token-volume.dto';
import { SwapDto } from '../swaps/dto/swap.dto';
import { TokenPrice } from '../token-price/entity/token-price.entity';
import { subtractMinutes } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { CRON_DISABLED } from 'src/constants/constants';

const VOLUME_INTERVAL_MINUTES = 5;

@Injectable()
export class VolumesService {
  private readonly logger = new Logger(VolumesService.name);

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
      t: tokenVolumes.t,
      v: tokenVolumes.v,
    };
  }

  @Cron(CronExpression.EVERY_5_MINUTES, { disabled: CRON_DISABLED })
  private async persistTokenVolumes(): Promise<void> {
    this.logger.log('Calculating token volumes');

    const minutesSinceLastVolume =
      await this.getMinutesElapsedSinceLastVolume();
    this.logger.log(`Minutes since last volume: ${minutesSinceLastVolume}`);

    const missingPeriods = Math.floor(
      minutesSinceLastVolume / VOLUME_INTERVAL_MINUTES,
    );
    this.logger.log(`Missing periods: ${missingPeriods}`);

    for (let periodsBack = 0; periodsBack < missingPeriods; periodsBack += 1) {
      const from = this.getVolumeDateFrom(periodsBack);
      const to = this.getVolumeDateTo(periodsBack);

      this.logger.log(`Calculating volume for period: ${from} - ${to}`);
      this.calcAndSaveTokenVolumes(from, to);
    }
  }

  private async calcAndSaveTokenVolumes(from: Date, to: Date): Promise<void> {
    const tokens = await this.tokenPriceService.findAll();
    const swaps = await this.swapService.findSwapsForPeriod(from, to);

    const tokenVolumes: TokenVolumeDto[] = await Promise.all(
      tokens.map(async (tokenEntity) => {
        const { token, assetId } = tokenEntity;
        const tokenSwaps = swaps.filter(
          (swap) =>
            swap.inputAssetId === assetId || swap.outputAssetId === assetId,
        );

        const volume = await this.calcVolumeForToken(
          tokenEntity,
          tokenSwaps,
          from,
          to,
        );

        return {
          token,
          volume,
          volumeAt: to,
        };
      }),
    );

    const positiveTokenVolumes = tokenVolumes.filter((tv) => tv.volume > 0);

    this.logger.log(
      `${positiveTokenVolumes.length} volumes available for period: ${from} - ${to}`,
    );

    await this.volumesRepo.insert(tokenVolumes);
  }

  private async calcVolumeForToken(
    tokenEntity: TokenPrice,
    tokenSwaps: SwapDto[],
    from: Date,
    to: Date,
  ): Promise<number> {
    const { token, assetId } = tokenEntity;

    const totalAmountSwapped = tokenSwaps.reduce((acc, swap) => {
      if (swap.inputAssetId === assetId) {
        return new Big(acc).add(swap.assetInputAmount).toNumber();
      }

      return new Big(acc).add(swap.assetOutputAmount).toNumber();
    }, 0);

    if (totalAmountSwapped === 0) {
      return 0;
    }

    const avgTokenPrice = await this.getAvgTokenPrice(token, from, to);

    return new Big(totalAmountSwapped).mul(avgTokenPrice).toNumber();
  }

  private getAvgTokenPrice(
    token: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    return this.chronoPriceService.getAvgTokenPriceForPeriod(token, from, to);
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

  private async getMinutesElapsedSinceLastVolume(): Promise<number> {
    const [{ minutes }] = await this.volumesRepo.query(
      MINUTES_ELAPSED_SINCE_LAST_VOLUME_QUERY,
    );

    return minutes;
  }

  private getVolumeDateFrom(periodsBack: number): Date {
    const dateFrom = subtractMinutes(
      new Date(),
      periodsBack * VOLUME_INTERVAL_MINUTES + VOLUME_INTERVAL_MINUTES,
    );
    dateFrom.setSeconds(0);

    return dateFrom;
  }

  private getVolumeDateTo(periodsBack: number): Date {
    const dateTo = subtractMinutes(
      new Date(),
      periodsBack * VOLUME_INTERVAL_MINUTES,
    );
    dateTo.setSeconds(-1); // Set time to end of the previous minute

    return dateTo;
  }
}
