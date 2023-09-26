import { Controller, Get, Param, Query } from '@nestjs/common';
import { SwapRepository } from './swaps.repository';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { SwapDto } from './dto/swap.dto';

@Controller('swaps')
export class SwapsController {
  constructor(private swapRepo: SwapRepository) {}

  @Get(':assetId')
  async findAll(
    @Query() pageOptions: PageOptionsDto,
    @Param('assetId') assetId: string,
  ): Promise<PageDto<SwapDto>> {
    return this.swapRepo.findSwapsByAssetId(pageOptions, assetId);
  }
}
