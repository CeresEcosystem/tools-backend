import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { SymbolChartSearchDto } from '../dto/symbol-chart-search.dto';
import { CurrentPrice } from '../entities/current-price.entity';

export class CurrentPriceToSymbolChartSearchMapper extends BaseDtoMapper<
  CurrentPrice,
  SymbolChartSearchDto
> {
  toDto(entity: CurrentPrice): SymbolChartSearchDto {
    const { token, fullName } = entity;

    return {
      symbol: token,
      full_name: fullName,
      description: fullName,
      ticker: token,
      exchange: 'Polkaswap',
      type: 'crypto',
    };
  }
}
