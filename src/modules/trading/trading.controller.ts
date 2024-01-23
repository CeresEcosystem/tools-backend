import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CHART_CONFIG } from './trading.const';
import { SymbolChartSearchDto } from './dto/symbol-chart-search.dto';
import { ChronoPriceService } from '../chrono-price/chrono-price.service';
import { TokenPricesQuery } from './dto/token-prices-dto';
import { SymbolsService } from '../symbols/symbols.service';
import { TokenPriceService } from '../token-price/token-price.service';
import { TokenPriceToSymbolSearchMapper } from './mapper/token-price-to-symbol-search.mapper';
import { SymbolChartMapper } from './mapper/symbol-to-chart-dto.mapper';
import { SymbolChartDto } from './dto/symbol-chart-dto';
import { ChartConfigDto } from './dto/chart-config-dto';

@Controller('trading')
@ApiTags('Trading Controller')
export class TradingController {
  constructor(
    private readonly symbolsService: SymbolsService,
    private readonly tokenPriceService: TokenPriceService,
    private readonly chronoPriceService: ChronoPriceService,
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

  // TODO: Define return type
  @Get('history')
  public getTokenHistoricPrices(
    @Query() queryParams: TokenPricesQuery,
  ): unknown {
    return this.chronoPriceService.getPriceForChart(
      queryParams.symbol,
      queryParams.resolution,
      queryParams.to,
      queryParams.countback,
    );
  }

  @Get('time')
  public getCurrentTime(): number {
    return Math.floor(Date.now() / 1000);
  }
}
