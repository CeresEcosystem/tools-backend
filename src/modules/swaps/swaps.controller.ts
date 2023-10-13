import { Controller, Get, Param, Query } from '@nestjs/common';
import { SwapService } from './swaps.service';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { SwapDto } from './dto/swap.dto';
import { SwapGateway } from './swaps.gateway';

@Controller('swaps')
export class SwapsController {
  constructor(
    private swapService: SwapService,
    private swapSocket: SwapGateway,
  ) {}

  @Get('favorites')
  async getSwapsByTokens(
    @Query() pageOptions: PageOptionsDto,
    @Query('token') tokens: string[],
  ): Promise<PageDto<SwapDto>> {
    return this.swapService.findSwapsByTokens(pageOptions, tokens);
  }

  @Get(':assetId')
  async getSwapsByToken(
    @Query() pageOptions: PageOptionsDto,
    @Param('assetId') assetId: string,
  ): Promise<PageDto<SwapDto>> {
    return this.swapService.findSwapsByToken(pageOptions, assetId);
  }
}
