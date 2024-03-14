import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PairLiquidityChangeDto } from './dto/pair-liquidity-change.dto';
import { PairsLiquidityService } from './pairs-liquidity.service';
import { PairPeriodicLiquidityChangeDto } from './dto/pair-periodic-liquidity-change.dto';
import { PairLiquidityProviderDto } from './dto/pair-liquidity-provider.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CACHE_KEYS, CACHE_TTL } from './pair-liquidity.constants';
import { Cache } from 'cache-manager';

@Controller('pairs-liquidity')
@ApiTags('Pairs Liquidity Controller')
export class PairsLiquidityController {
  constructor(
    private readonly pairsLiquidityChangesService: PairsLiquidityService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Get('/:assetA/:assetB')
  public getLiquidityChanges(
    @Param('assetA') assetA: string,
    @Param('assetB') assetB: string,
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageDto<PairLiquidityChangeDto>> {
    return this.pairsLiquidityChangesService.find(assetA, assetB, pageOptions);
  }

  @Get('/history/:baseSymbol/:tokenSymbol')
  public getPeriodicLiquidityChanges(
    @Param('baseSymbol') baseSymbol: string,
    @Param('tokenSymbol') tokenSymbol: string,
  ): Promise<PairPeriodicLiquidityChangeDto[]> {
    return this.pairsLiquidityChangesService.getPeriodicChanges(
      baseSymbol,
      tokenSymbol,
    );
  }

  @Get('/providers/:baseAsset/:tokenAsset')
  public getLiquidityProviders(
    @Param('baseAsset') baseAsset: string,
    @Param('tokenAsset') tokenAsset: string,
  ): Promise<PairLiquidityProviderDto[]> {
    return this.cacheManager.wrap(
      `${CACHE_KEYS.PROVIDERS}-${baseAsset}-${tokenAsset}`,
      () =>
        this.pairsLiquidityChangesService.getLiquidityProviders(
          baseAsset,
          tokenAsset,
        ),
      CACHE_TTL.HALF_HOUR,
    );
  }
}
