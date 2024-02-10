import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CHART_CONFIG } from './trading.const';
import { SymbolChartSearchDto } from './dto/symbol-chart-search.dto';
import { TradingChartQuery } from './dto/trading-chart-query.dto';
import { SymbolsService } from '../symbols/symbols.service';
import { TokenPriceService } from '../token-price/token-price.service';
import { TokenPriceToSymbolSearchMapper } from './mapper/token-price-to-symbol-search.mapper';
import { SymbolChartMapper } from './mapper/symbol-to-chart-dto.mapper';
import { SymbolChartDto } from './dto/symbol-chart-dto';
import { ChartConfigDto } from './dto/chart-config-dto';
import { TradingChartDto } from './dto/trading-chart.dto';
import { TradingService } from './trading.service';

@Controller('trading')
@ApiTags('Trading Controller')
export class TradingController {
  constructor(
    private readonly symbolsService: SymbolsService,
    private readonly tokenPriceService: TokenPriceService,
    private readonly tradingService: TradingService,
    private readonly tokenPriceToSymbolMapper: TokenPriceToSymbolSearchMapper,
    private readonly symbolChartMapper: SymbolChartMapper,
  ) {}

  @Get('config')
  public getChartConfig(): ChartConfigDto {
    return CHART_CONFIG;
  }

  @Get('symbols')
  public getSymbol(@Query('symbol') symbol: string): Promise<SymbolChartDto> {
    return this.symbolChartMapper.toDtoAsync(
      this.symbolsService.findOneOrFail(symbol),
    );
  }

  @Get('search')
  public searchSymbols(
    @Query('query') query: string,
  ): Promise<SymbolChartSearchDto[]> {
    const searchTerms = query.split(' ');
    const prices = this.tokenPriceService.searchByFullNameTerms(searchTerms);

    return this.tokenPriceToSymbolMapper.toDtosAsync(prices);
  }

  @Get('history')
  public getTokenHistoricPrices(
    @Query() queryParams: TradingChartQuery,
  ): Promise<TradingChartDto> {
    return this.tradingService.getTradingChartData(queryParams);
  }

  @Get('time')
  public getCurrentTime(): number {
    return Math.floor(Date.now() / 1000);
  }
}
