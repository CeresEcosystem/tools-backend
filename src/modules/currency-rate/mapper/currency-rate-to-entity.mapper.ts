import { CurrencyRate } from '../entity/currency-rate.entity';
import { CurrencyRateDto } from '../dto/currency-rate.dto';
import { BaseEntityMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

export class CurrencyRateToEntityMapper extends BaseEntityMapper<
  CurrencyRate,
  CurrencyRateDto
> {
  toEntity(dto: CurrencyRateDto): CurrencyRate {
    const { currency, rate } = dto;

    return {
      currency,
      rate,
    } as CurrencyRate;
  }
}
