import { SwapRepository } from './swaps.repository';
import { Injectable, Logger } from '@nestjs/common';
import { SwapDto } from './dto/swap.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SwapOptionsDto } from './dto/swap-options.dto';
import { SwapsStatsDto } from './dto/swaps-stats.dto';
import {
  PageOptionsDto,
  PageDto,
  PageWithSummaryDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

const SWAPS_TTL_DAYS = 30;

@Injectable()
export class SwapService {
  private readonly logger = new Logger(SwapService.name);

  constructor(private readonly swapRepo: SwapRepository) {}

  public findAllSwaps(
    pageOptions: PageOptionsDto,
    swapOptions: SwapOptionsDto,
  ): Promise<PageDto<SwapDto>> {
    return this.swapRepo.findAllSwaps(pageOptions, swapOptions);
  }

  public findSwapsByTokens(
    pageOptions: PageOptionsDto,
    swapOptions: SwapOptionsDto,
    tokens: string[],
  ): Promise<PageWithSummaryDto<SwapDto, SwapsStatsDto>> {
    return this.swapRepo.findSwapsByAssetIds(pageOptions, swapOptions, tokens);
  }

  public findSwapsByAccount(
    pageOptions: PageOptionsDto,
    accountId: string,
  ): Promise<PageDto<SwapDto>> {
    return this.swapRepo.findSwapsByAccountId(pageOptions, accountId);
  }

  public findSwapsForPeriod(from: Date, to: Date): Promise<SwapDto[]> {
    return this.swapRepo.findSwapsForPeriod(from, to);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async cleanUpSwaps(): Promise<void> {
    this.logger.log('Start cleaning up old token swaps.');

    await this.swapRepo.deleteOlderThanDays(SWAPS_TTL_DAYS);

    this.logger.log('Finished cleaning up old token swaps.');
  }
}
