import { Module } from '@nestjs/common';
import { TokenPriceModule } from '../token-price/token-price.module';
import { SymbolsModule } from '../symbols/symbols.module';
import { TradingController } from './trading.controller';
import { ChronoPriceModule } from '../chrono-price/chrono-price.module';
import { SymbolChartMapper } from './mapper/symbol-to-chart-dto.mapper';
import { TokenPriceToSymbolSearchMapper } from './mapper/token-price-to-symbol-search.mapper';

@Module({
  imports: [SymbolsModule, TokenPriceModule, ChronoPriceModule],
  controllers: [TradingController],
  providers: [TokenPriceToSymbolSearchMapper, SymbolChartMapper],
  exports: [],
})
export class TradingModule {}
