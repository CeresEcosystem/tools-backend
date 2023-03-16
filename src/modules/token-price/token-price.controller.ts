import {
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokenPriceService } from './token-price.service';
import { TokenPriceDto } from './dto/token-price.dto';
import { TokenPriceToDtoMapper } from './mapper/token-price-to-dto.mapper';
import { Cache } from 'cache-manager';
import { CACHE_KEYS, CACHE_TTL } from './token-price.constants';

@Controller('prices')
@ApiTags('Prices Controller')
export class TokenPriceController {
  private readonly logger = new Logger(TokenPriceController.name);

  constructor(
    private readonly tokenPriceService: TokenPriceService,
    private readonly mapper: TokenPriceToDtoMapper,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Get()
  public getPrices(): Promise<TokenPriceDto[]> {
    return this.cacheManager.wrap(
      CACHE_KEYS.PRICES,
      () => this.mapper.toDtosAsync(this.tokenPriceService.findAll()),
      CACHE_TTL.TWO_MINUTES,
    );
  }

  @Get('/:token')
  public getPrice(@Param('token') token: string): Promise<string> {
    return this.cacheManager.wrap(
      `${CACHE_KEYS.PRICES}-${token}`,
      async () => {
        const { price } = await this.tokenPriceService.findByToken(token);
        return price;
      },
      CACHE_TTL.TWO_MINUTES,
    );
  }
}
