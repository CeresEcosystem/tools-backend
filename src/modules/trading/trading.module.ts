import { Module } from '@nestjs/common';
import { TokenPriceModule } from '../token-price/token-price.module';
import { SymbolModule } from '../symbol/symbol.module';
import { TokenPriceToSymbolChartSearchMapper } from './mapper/token-price-to-symbol-search-chart.mapper';
import { TradingController } from './trading.controller';
import { ChronoPriceModule } from '../chrono-price/chrono-price.module';

@Module({
  imports: [SymbolModule, TokenPriceModule, ChronoPriceModule],
  controllers: [TradingController],
  providers: [TokenPriceToSymbolChartSearchMapper],
  exports: [],
})
export class TradingModule {}
