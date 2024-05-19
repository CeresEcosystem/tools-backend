import { CurrencyRate } from '../entity/currency-rate.entity';
import { CurrencyRateResponseDto } from '../dto/currency-rate-response.dto';
import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

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
