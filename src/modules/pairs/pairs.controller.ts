import { CACHE_MANAGER, Controller, Get, Inject, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PairToDtoMapper } from './mapper/pair-to-dto.mapper';
import { Cache } from 'cache-manager';
import { CACHE_KEYS, CACHE_TTL } from './pairs.constants';
import { PairsService } from './pairs.service';
import { PairDto } from './dto/pair.dto';

@Controller('pairs')
@ApiTags('Pairs Controller')
export class PairsController {
  private readonly logger = new Logger(PairsController.name);

  constructor(
    private readonly pairsService: PairsService,
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
}
