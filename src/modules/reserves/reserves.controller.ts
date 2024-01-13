import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ReservesService } from './reserves.service';
import { ReservesDto } from './dto/reserves.dto';
import { ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CACHE_KEYS, CACHE_TTL } from './reserves.const';

@Controller('/reserves')
@ApiTags('Reserves controller')
export class ReservesController {
  constructor(
    private readonly reservesService: ReservesService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Get(':tokenSymbol')
  public getReserves(
    @Param('tokenSymbol') tokenSymbol: string,
  ): Promise<ReservesDto> {
    return this.cacheManager.wrap(
      `${CACHE_KEYS.RESERVES}-${tokenSymbol}`,
      () => this.reservesService.getTokensReserves(tokenSymbol),
      CACHE_TTL.ONE_HOUR,
    );
  }
}
