import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchOptionsDto } from './dto/search-request.dto';
import { BurningToken, TokenBurnService } from './token-burn.service';
import { TokenBurnDto } from './dto/token-burn.dto';
import { TokenBurnSummaryDto } from './dto/token-burn-summary.dto';
import {
  PageOptionsDto,
  PageWithSummaryDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

/** @deprecated */
@Controller('kensetsu')
@ApiTags('Kensetsu Controller')
export class KensetsuController {
  constructor(private readonly tokenBurnService: TokenBurnService) {}

  /** @deprecated */
  @Get('/burns')
  public getKensetsuBurns(
    @Query() searchOptions: SearchOptionsDto,
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageWithSummaryDto<TokenBurnDto, TokenBurnSummaryDto>> {
    return this.tokenBurnService.getTokenBurns(
      searchOptions,
      pageOptions,
      BurningToken.KENSETSU,
    );
  }
}
