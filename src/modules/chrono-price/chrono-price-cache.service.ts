/* eslint-disable no-await-in-loop */
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PRICE_HISTORY_QUERY_ALL_TOKENS } from './chrono-price.const';
import {
  AggResolution,
  ChronoPriceAgg,
} from './entity/chrono-price-agg.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

const MONTH_IN_SECONDS = 30 * 24 * 60 * 60;
const RESOLUTIONS = ['5m', '15m', '30m', '60m', '1D'];
const BATCH_SIZE = 1000;

type AggPriceResult = {
  token: string;
  period_date: Date;
  period_epoch: string;
  open: number;
  close: number;
  high: number;
  low: number;
};

@Injectable()
export class ChronoPriceCacheService {
  private readonly logger = new Logger(ChronoPriceCacheService.name);
  private cachingInProgress = false;

  constructor(
    @InjectDataSource('pg')
    private readonly dataSource: DataSource,
    @InjectRepository(ChronoPriceAgg, 'pg')
    private readonly aggPriceRepo: Repository<ChronoPriceAgg>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  private async cachePrices(): Promise<void> {
    if (this.cachingInProgress) {
      this.logger.log('Caching already in progress, aborting.');

      return;
    }

    this.cachingInProgress = true;

    try {
      for (let i = 0; i < RESOLUTIONS.length; i += 1) {
        await this.cachePricesForResolution(RESOLUTIONS[i]);
      }
    } catch (ex) {
      this.logger.error('Error happened while populating price agg table', ex);
    } finally {
      this.cachingInProgress = false;
    }
  }

  private async cachePricesForResolution(resolution: string): Promise<void> {
    this.logger.log(`Caching prices for resolution ${resolution}`);

    const lastPeriodEpoch = await this.getLastPeriodForResolution(resolution);

    let min = lastPeriodEpoch;
    let max = min + MONTH_IN_SECONDS;
    let results = [];

    do {
      const params = [resolution, min, max];

      results = (await this.dataSource.query(
        PRICE_HISTORY_QUERY_ALL_TOKENS,
        params,
      )) as AggPriceResult[];

      const aggEntities = results
        .filter((result) => result.period_date && result.period_epoch)
        .map((result) => this.buildAggPriceEntity(resolution, result));

      this.logger.log(`Fetched ${aggEntities.length} agg entities`);

      for (let i = 0; i < aggEntities.length; i += BATCH_SIZE) {
        const aggEntitiesBatch = aggEntities.slice(i, i + BATCH_SIZE);

        await this.aggPriceRepo.upsert(aggEntitiesBatch, [
          'token',
          'resolution',
          'periodEpoch',
        ]);
      }

      min = max;
      max = min + MONTH_IN_SECONDS;
    } while (results.length > 0);

    this.logger.log(`Finished caching prices for resolution ${resolution}`);
  }

  private buildAggPriceEntity(
    resolution: string,
    result: AggPriceResult,
  ): ChronoPriceAgg {
    return {
      token: result.token,
      resolution,
      periodDate: result.period_date,
      periodEpoch: result.period_epoch,
      open: result.open || 0,
      close: result.close || 0,
      high: result.high || 0,
      low: result.low || 0,
      createdAt: new Date(),
    } as ChronoPriceAgg;
  }

  private async getLastPeriodForResolution(
    resolution: string,
  ): Promise<number> {
    const lastElem = await this.aggPriceRepo.findOne({
      where: { resolution: resolution as AggResolution },
      order: { periodEpoch: 'DESC' },
    });

    return Number(lastElem?.periodEpoch) || 1634811000;
  }
}
