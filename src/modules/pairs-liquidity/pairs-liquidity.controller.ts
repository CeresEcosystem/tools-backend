import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PairLiquidityChangeDto } from './dto/pair-liquidity-change.dto';
import { PairsLiquidityService } from './pairs-liquidity.service';

@Controller('pairs-liquidity')
@ApiTags('Pairs Liquidity Controller')
export class PairsLiquidityController {
  private readonly logger = new Logger(PairsLiquidityController.name);

  constructor(
    private readonly pairsLiquidityChangesService: PairsLiquidityService,
  ) {}

  @Get('/:assetA/:assetB')
  public getLiquidityChanges(
    @Param('assetA') assetA: string,
    @Param('assetB') assetB: string,
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageDto<PairLiquidityChangeDto>> {
    return this.pairsLiquidityChangesService.find(assetA, assetB, pageOptions);
  }
}
