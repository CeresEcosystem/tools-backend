import { Controller, Get, Param, ParseEnumPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchOptionsDto } from './dto/search-request.dto';
import { TokenBurnDto } from './dto/token-burn.dto';
import { TokenBurnSummaryDto } from './dto/token-burn-summary.dto';
import { BurningToken, TokenBurnService } from './token-burn.service';
import {
  PageOptionsDto,
  PageWithSummaryDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Controller('burns')
@ApiTags('Token Burn Controller')
export class TokenBurnController {
  constructor(private readonly tokenBurnService: TokenBurnService) {}

  @Get('/:token')
  public getTokenBurns(
    @Param('token', new ParseEnumPipe(BurningToken)) token: BurningToken,
    @Query() searchOptions: SearchOptionsDto,
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageWithSummaryDto<TokenBurnDto, TokenBurnSummaryDto>> {
    return this.tokenBurnService.getTokenBurns(
      searchOptions,
      pageOptions,
      token,
    );
  }
}
