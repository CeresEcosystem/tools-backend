import { Controller, Get, Param, Query } from '@nestjs/common';
import { SwapService } from './swaps.service';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { SwapDto } from './dto/swap.dto';

@Controller('swaps')
export class SwapsController {
  constructor(private swapService: SwapService) {}

  @Get(':assetId')
  async getSwapsByToken(
    @Query() pageOptions: PageOptionsDto,
    @Param('assetId') assetId: string,
  ): Promise<PageDto<SwapDto>> {
    return this.swapService.findSwapsByToken(pageOptions, assetId);
  }
}
