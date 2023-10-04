import { Controller, Get, Inject, Logger, Param } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { PairToDtoMapper } from './mapper/pair-to-dto.mapper';
import { Cache } from 'cache-manager';
import { CACHE_KEYS, CACHE_TTL } from './pairs.constants';
import { PairsService } from './pairs.service';
import { PairDto } from './dto/pair.dto';
import { PairsLiquidityChangesService } from './pairs-liquidity-changes.service';
import { PairsLiquidityChangeEntity } from './entity/pairs-liquidity-change.entity';

@Controller('pairs')
@ApiTags('Pairs Controller')
export class PairsController {
  private readonly logger = new Logger(PairsController.name);

  constructor(
    private readonly pairsService: PairsService,
    private readonly pairsLiquidityChangesService: PairsLiquidityChangesService,
    private readonly mapper: PairToDtoMapper,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Get()
  public getPairs(): Promise<PairDto[]> {
    return this.cacheManager.wrap(
      CACHE_KEYS.PAIRS,
      () => this.mapper.toDtosAsync(this.pairsService.findAll()),
      CACHE_TTL.TWO_MINUTES,
    );
  }

  @Get('/tvl')
  public getTVL(): Promise<number> {
    return this.cacheManager.wrap(
      CACHE_KEYS.PAIRS_TVL,
      () => this.pairsService.calculateTVL(),
      CACHE_TTL.ONE_MINUTE,
    );
  }

  @Get('/liquidity-changes/:assetA/:assetB')
  public getLiquidityChanges(
    @Param('assetA') assetA: string,
    @Param('assetB') assetB: string,
  ): Promise<PairsLiquidityChangeEntity> {
    return this.pairsLiquidityChangesService.find(assetA, assetB);
  }
}
