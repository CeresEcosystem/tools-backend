import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { CurrencyRate } from '../entity/currency-rate.entity';
import { CurrencyRateResponseDto } from '../dto/currency-rate-response.dto';

export class CurrencyRateToDtoMapper extends BaseDtoMapper<
  CurrencyRate,
  CurrencyRateResponseDto
> {
  toDto(entity: CurrencyRate): CurrencyRateResponseDto {
    const { currency, rate, updatedAt } = entity;

    return {
      currency,
      rate,
      updatedAt,
    };
  }
}
