import { SwapRepository } from './swaps.repository';
import { Injectable, Logger } from '@nestjs/common';
import { SwapDto } from './dto/swap.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

const SWAPS_TTL_DAYS = 30;

@Injectable()
export class SwapService {
  private readonly logger = new Logger(SwapService.name);

  constructor(private readonly swapRepo: SwapRepository) {}

  findSwapsByToken(
    pageOptions: PageOptionsDto,
    assetId: string,
  ): Promise<PageDto<SwapDto>> {
    return this.swapRepo.findSwapsByAssetId(pageOptions, assetId);
  }

  findSwapsByTokens(
    pageOptions: PageOptionsDto,
    tokens: string[],
  ): Promise<PageDto<SwapDto>> {
    return this.swapRepo.findSwapsByAssetIds(pageOptions, tokens);
  }

  findSwapsByAccount(
    pageOptions: PageOptionsDto,
    accountId: string,
  ): Promise<PageDto<SwapDto>> {
    return this.swapRepo.findSwapsByAccountId(pageOptions, accountId);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async cleanUpSwaps() {
    this.logger.log('Start cleaning up old token swaps.');

    await this.swapRepo.deleteOlderThanDays(SWAPS_TTL_DAYS);

    this.logger.log('Finished cleaning up old token swaps.');
  }
}
