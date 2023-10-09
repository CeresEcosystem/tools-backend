import { SwapRepository } from './swaps.repository';
import { Injectable } from '@nestjs/common';
import { SwapDto } from './dto/swap.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';

@Injectable()
export class SwapService {
  constructor(private swapRepo: SwapRepository) {}

  findSwapsByToken(
    pageOptions: PageOptionsDto,
    assetId: string,
  ): Promise<PageDto<SwapDto>> {
    return this.swapRepo.findSwapsByAssetId(pageOptions, assetId);
  }

  findSwapsByAccount(
    pageOptions: PageOptionsDto,
    accountId: string,
  ): Promise<PageDto<SwapDto>> {
    return this.swapRepo.findSwapsByAccountId(pageOptions, accountId);
  }
}
