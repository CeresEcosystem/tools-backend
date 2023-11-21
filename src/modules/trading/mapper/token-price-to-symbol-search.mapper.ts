/* eslint-disable camelcase */
import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { SymbolChartSearchDto } from '../dto/symbol-chart-search.dto';
import { TokenPrice } from '../../token-price/entity/token-price.entity';

export class TokenPriceToSymbolSearchMapper extends BaseDtoMapper<
  TokenPrice,
  SymbolChartSearchDto
> {
  toDto(entity: TokenPrice): SymbolChartSearchDto {
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
