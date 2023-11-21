import { Controller, Get, Query } from '@nestjs/common';
import { SwapService } from './swaps.service';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { SwapDto } from './dto/swap.dto';

@Controller('swaps')
export class SwapsController {
  constructor(private swapService: SwapService) {}

  @Get()
  public getSwapsByTokens(
    @Query() pageOptions: PageOptionsDto,
    @Query('token') tokens: string[],
  ): Promise<PageDto<SwapDto>> {
    const tokensArr = Array.isArray(tokens) ? tokens : [tokens];

    return this.swapService.findSwapsByTokens(pageOptions, tokensArr);
  }
}
