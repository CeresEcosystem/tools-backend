import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CHART_CONFIG, SYMBOL_EXTENSION } from './trading.const';
import { SymbolService } from './symbol.service';
import { SymbolChartSearchDto } from './dto/symbol-chart-search.dto';
import { PriceService } from './price.service';
import { TokenPricesDto } from './dto/token-prices-dto';

@Controller('trading')
@ApiTags('Trading Controller')
export class TradingController {
  constructor(
    private readonly symbolService: SymbolService,
    private readonly priceService: PriceService,
  ) {}

  @Get('config')
  getChartConfig() {
    return CHART_CONFIG;
  }

  @Get('symbols')
  async getSymbol(@Query('symbol') symbol: string) {
    const token = await this.symbolService.findOne(symbol);

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
    return this.symbolService.searchForChart(query);
  }

  @Get('history')
  getTokenHistoricPrices(@Query() queryParams: TokenPricesDto) {
    return this.priceService.getPriceForChart(
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
