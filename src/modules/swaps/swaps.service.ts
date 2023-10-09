import { Injectable, Logger } from '@nestjs/common';
import { SwapRepository } from './swaps.repository';
import { Cron, CronExpression } from '@nestjs/schedule';

const SWAPS_TTL_DAYS = 30;

@Injectable()
export class SwapService {
  private readonly logger = new Logger(SwapService.name);

  constructor(private readonly swapRepository: SwapRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async cleanUpSwaps() {
    this.logger.log('Start cleaning up old token swaps.');

    await this.swapRepository.deleteOlderThanDays(SWAPS_TTL_DAYS);

    this.logger.log('Finished cleaning up old token swaps.');
  }
}
