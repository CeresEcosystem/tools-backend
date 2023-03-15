import {
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentPriceService } from './current-price.service';
import { CurrentPriceDto } from './dto/current-price.dto';
import { CurrentPriceToDtoMapper } from './mapper/current-price-to-dto.mapper';
import { Cache } from 'cache-manager';
import { CACHE_KEYS, CACHE_TTL } from './current-price.constants';

@Controller('prices')
@ApiTags('Prices Controller')
export class CurrentPriceController {
  private readonly logger = new Logger(CurrentPriceController.name);

  constructor(
    private readonly currentPriceService: CurrentPriceService,
    private readonly mapper: CurrentPriceToDtoMapper,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Get()
  public getPrices(): Promise<CurrentPriceDto[]> {
    return this.cacheManager.wrap(
      CACHE_KEYS.PRICES,
      () => this.mapper.toDtosAsync(this.currentPriceService.findAll()),
      CACHE_TTL.TWO_MINUTES,
    );
  }

  @Get('/:token')
  public getPrice(@Param('token') token: string): Promise<string> {
    return this.cacheManager.wrap(
      `${CACHE_KEYS.PRICES}-${token}`,
      async () => {
        const { price } = await this.currentPriceService.findByToken(token);
        return price;
      },
      CACHE_TTL.TWO_MINUTES,
    );
  }
}
