import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PairLiquidityChangeDto } from './dto/pair-liquidity-change.dto';
import { PairsLiquidityService } from './pairs-liquidity.service';
import { PairPeriodicLiquidityChangeDto } from './dto/pair-periodic-liquidity-change.dto';

@Controller('pairs-liquidity')
@ApiTags('Pairs Liquidity Controller')
export class PairsLiquidityController {
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

  @Get('/periodic-difference/:baseSymbol/:tokenSymbol')
  public getPeriodicLiquidityChanges(
    @Param('baseSymbol') baseSymbol: string,
    @Param('tokenSymbol') tokenSymbol: string,
  ): Promise<PairPeriodicLiquidityChangeDto[]> {
    return this.pairsLiquidityChangesService.getPeriodicChanges(
      baseSymbol,
      tokenSymbol,
    );
  }
}
