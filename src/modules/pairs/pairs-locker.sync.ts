import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CeresClient } from '../ceres-client/ceres-client';
import { PairsService } from './pairs.service';
import { CronExpression } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { CRON_DISABLED } from 'src/constants/constants';

@Injectable()
export class PairsLockerSync {
  private readonly logger = new Logger(PairsLockerSync.name);

  constructor(
    private readonly ceresClient: CeresClient,
    private readonly pairsService: PairsService,
  ) {}

  @Cron(CronExpression.EVERY_2_MINUTES, { disabled: CRON_DISABLED })
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
