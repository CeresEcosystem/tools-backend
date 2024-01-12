import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { CurrencyRate } from '../entity/currency-rate.entity';
import { CurrencyRateDto } from '../dto/currency-rate.dto';

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
