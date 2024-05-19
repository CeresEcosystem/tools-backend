import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SwapService } from './swaps.service';
import { SwapDto } from './dto/swap.dto';
import { ApiTags } from '@nestjs/swagger';
import { SwapOptionsDto } from './dto/swap-options.dto';
import { SwapTokensDto } from './dto/swap-tokens.dto';
import { SwapsStatsDto } from './dto/swaps-stats.dto';
import {
  PageOptionsDto,
  PageWithSummaryDto,
  PageDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Controller('swaps')
@ApiTags('Swaps controller')
export class SwapsController {
  constructor(private swapService: SwapService) {}

  @Post()
  public getSwapsForTokens(
    @Body() swapTokens: SwapTokensDto,
    @Query() pageOptions: PageOptionsDto,
    @Query() swapOptions: SwapOptionsDto,
  ): Promise<PageWithSummaryDto<SwapDto, SwapsStatsDto>> {
    return this.swapService.findSwapsByTokens(
      pageOptions,
      swapOptions,
      swapTokens.tokens,
    );
  }

  @Get('all')
  public getAllSwaps(
    @Query() pageOptions: PageOptionsDto,
    @Query() swapOptions: SwapOptionsDto,
  ): Promise<PageDto<SwapDto>> {
    return this.swapService.findAllSwaps(pageOptions, swapOptions);
  }
}
