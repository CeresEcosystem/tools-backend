import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { CeresClient } from '../ceres-client/ceres-client';
import { PairsService } from './pairs.service';

@Injectable()
export class PairsLockerSync {
  private readonly logger = new Logger(PairsLockerSync.name);

  constructor(
    private readonly ceresClient: CeresClient,
    private readonly pairsService: PairsService,
  ) {}

  // Every 2 minutes
  @Cron(CronExpression.EVERY_12_HOURS)
  async fetchLiquidityLocks(): Promise<void> {
    this.logger.log('Start fetching liquidity locks.');

    const liquidityLocks = await this.ceresClient.getLiquidityLocks();

    liquidityLocks.forEach(async (liquidityLock) => {
      const { baseAsset, token, total } = liquidityLock;
      const pair = await this.pairsService.findOne(baseAsset, token);

      if (pair) {
        pair.lockedLiquidity = total;
        this.pairsService.update(pair);
      }
    });

    this.logger.log('Fetching of liquidity locks was successful!');
  }
}
