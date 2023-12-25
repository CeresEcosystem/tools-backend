import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SwapService } from './swaps.service';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { SwapDto } from './dto/swap.dto';
import { ApiTags } from '@nestjs/swagger';
import { SwapOptionsDto } from './dto/swap-options.dto';
import { SwapTokensDto } from './dto/swap-tokens.dto';

@Controller('swaps')
@ApiTags('Swaps controller')
export class SwapsController {
  constructor(private swapService: SwapService) {}

  @Get()
  public getSwapsByTokens(
    @Query() pageOptions: PageOptionsDto,
    @Query() swapOptions: SwapOptionsDto,
    @Query('token') tokens: string[],
  ): Promise<PageDto<SwapDto>> {
    const tokensArr = Array.isArray(tokens) ? tokens : [tokens];

    return this.swapService.findSwapsByTokens(
      pageOptions,
      swapOptions,
      tokensArr,
    );
  }

  @Post()
  public getSwapsForTokens(
    @Body() swapTokens: SwapTokensDto,
    @Query() pageOptions: PageOptionsDto,
    @Query() swapOptions: SwapOptionsDto,
  ): Promise<PageDto<SwapDto>> {
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
