import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CHART_CONFIG, SYMBOL_EXTENSION } from './trading.const';
import { SymbolChartSearchDto } from './dto/symbol-chart-search.dto';
import { ChronoPriceService } from '../chrono-price/chrono-price.service';
import { TokenPricesQuery } from './dto/token-prices-dto';
import { SymbolService } from '../symbol/symbol.service';
import { TokenPriceService } from '../token-price/token-price.service';
import { TokenPriceToSymbolChartSearchMapper } from './mapper/token-price-to-symbol-search-chart.mapper';

@Controller('trading')
@ApiTags('Trading Controller')
export class TradingController {
  constructor(
    private readonly symbolService: SymbolService,
    private readonly tokenPriceService: TokenPriceService,
    private readonly chronoPriceService: ChronoPriceService,
    private readonly mapper: TokenPriceToSymbolChartSearchMapper,
  ) {}

  @Get('config')
  getChartConfig() {
    return CHART_CONFIG;
  }

  @Get('symbols')
  async getSymbol(@Query('symbol') symbol: string) {
    const token = await this.symbolService.findOneOrFail(symbol);

    return {
      ...token,
      'exchange-traded': token.exchangeTraded,
      'exchange-listed': token.exchangeListed,
      'has-intraday': token.hasIntraday,
      'has-no-volume': token.hasNoVolume,
      ...SYMBOL_EXTENSION,
    };
  }

  @Get('search')
  searchSymbols(
    @Query('query') query: string,
  ): Promise<SymbolChartSearchDto[]> {
    const searchTerms = query.split(' ');
    const prices = this.tokenPriceService.searchByFullNameTerms(searchTerms);

    return this.mapper.toDtosAsync(prices);
  }

  @Get('history')
  getTokenHistoricPrices(@Query() queryParams: TokenPricesQuery) {
    return this.chronoPriceService.getPriceForChart(
      queryParams.symbol,
      queryParams.resolution,
      queryParams.from,
      queryParams.to,
      queryParams.countback,
    );
  }

  @Get('time')
  getCurrentTime(): number {
    return Math.floor(Date.now() / 1000);
  }
}
