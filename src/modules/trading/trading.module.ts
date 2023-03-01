import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrentPrice } from './entities/current-price.entity';
import { TokenSymbol } from './entities/symbol.entity';
import { CurrentPriceToSymbolChartSearchMapper } from './mapper/current-price-to-symbol-search-chart.mapper';
import { PriceService } from './price.service';
import { SymbolService } from './symbol.service';
import { TradingController } from './trading.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TokenSymbol, CurrentPrice])],
  controllers: [TradingController],
  providers: [
    SymbolService,
    PriceService,
    CurrentPriceToSymbolChartSearchMapper,
  ],
  exports: [],
})
export class TradingModule {}
