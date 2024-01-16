import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrencyRateService } from './currency-rate.service';
import { CurrencyRateToDtoMapper } from './mapper/currency-rate-to-dto.mapper';
import { CurrencyRateResponseDto } from './dto/currency-rate-response.dto';

@Controller('currency-rate')
@ApiTags('Currency rate controller')
export class CurrencyRateController {
  constructor(
    private currencyRateService: CurrencyRateService,
    private readonly toDtoMapper: CurrencyRateToDtoMapper,
  ) {}

  @Get(':currency')
  public getCurrencyRate(
    @Param('currency') currency: string,
  ): Promise<CurrencyRateResponseDto> {
    return this.toDtoMapper.toDtoAsync(
      this.currencyRateService.getCurrencyRate(currency),
    );
  }
}
