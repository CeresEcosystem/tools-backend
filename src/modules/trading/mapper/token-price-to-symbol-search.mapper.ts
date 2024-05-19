/* eslint-disable camelcase */
import { SymbolChartSearchDto } from '../dto/symbol-chart-search.dto';
import { TokenPrice } from '../../token-price/entity/token-price.entity';
import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

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
