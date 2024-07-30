import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TokenPriceService } from './token-price.service';
import { CeresClient } from '../ceres-client/ceres-client';
import { CronExpression } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { CRON_DISABLED } from 'src/constants/constants';

@Injectable()
export class TokenLockerSync {
  private readonly logger = new Logger(TokenLockerSync.name);

  constructor(
    private readonly ceresClient: CeresClient,
    private readonly tokenPriceService: TokenPriceService,
  ) {}

  @Cron(CronExpression.EVERY_2_MINUTES, { disabled: CRON_DISABLED })
  async fetchTokenLocks(): Promise<void> {
    this.logger.log('Start fetching token locks.');

    const tokenLocks = await this.ceresClient.getTokenLocks();

    tokenLocks.forEach(async (tokenLock) => {
      const token = await this.tokenPriceService.findByToken(tokenLock.token);

      if (token) {
        token.lockedTokens = tokenLock.total;
        this.tokenPriceService.update(token);
      }
    });

    this.logger.log('Fetching of tokens locks was successful!');
  }
}
