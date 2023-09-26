import { TokenSymbol } from 'src/modules/symbols/entity/symbol.entity';
import { SymbolChartDto } from '../dto/symbol-chart-dto';
import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { CHART_SUPPORTED_RESOLUTIONS } from '../trading.const';

export class SymbolChartMapper extends BaseDtoMapper<
  TokenSymbol,
  SymbolChartDto
> {
  toDto(entity: TokenSymbol): SymbolChartDto {
    const {
      name,
      exchangeTraded,
      exchangeListed,
      timezone,
      minMovement1,
      minMovement2,
      priceScale,
      hasIntraday,
      hasNoVolume,
      description,
      type,
      ticker,
    } = entity;

    return {
      name,
      exchange: exchangeTraded,
      listed_exchange: exchangeListed,
      timezone,
      minmovement: minMovement1,
      minmovement2: minMovement2,
      pricescale: priceScale,
      has_intraday: hasIntraday,
      has_no_volume: hasNoVolume,
      description,
      type,
      ticker,
      intraday_multipliers: CHART_SUPPORTED_RESOLUTIONS,
      supported_resolutions: CHART_SUPPORTED_RESOLUTIONS,
      session: '24x7',
      has_daily: true,
    };
  }
}
