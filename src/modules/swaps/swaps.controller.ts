import { Controller, Get, Query } from '@nestjs/common';
import { SwapService } from './swaps.service';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { SwapDto } from './dto/swap.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('swaps')
@ApiTags('Swaps controller')
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

  @Get('all')
  public getAllSwaps(
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageDto<SwapDto>> {
    return this.swapService.findAllSwaps(pageOptions);
  }
}
