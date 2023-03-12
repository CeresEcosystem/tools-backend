import { Module } from '@nestjs/common';
import { CurrentPriceModule } from '../current-price/current-price.module';
import { SymbolModule } from '../symbol/symbol.module';
import { CurrentPriceToSymbolChartSearchMapper } from './mapper/current-price-to-symbol-search-chart.mapper';
import { TradingController } from './trading.controller';
import { ChronoPriceModule } from '../chrono-price/chrono-price.module';

@Module({
  imports: [SymbolModule, CurrentPriceModule, ChronoPriceModule],
  controllers: [TradingController],
  providers: [CurrentPriceToSymbolChartSearchMapper],
  exports: [],
})
export class TradingModule {}
