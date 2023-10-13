import { SwapRepository } from './swaps.repository';
import { Injectable } from '@nestjs/common';
import { SwapDto } from './dto/swap.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';

@Injectable()
export class SwapService {
  constructor(private swapRepo: SwapRepository) {}

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
}
