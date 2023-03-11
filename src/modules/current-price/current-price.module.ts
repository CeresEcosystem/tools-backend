import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrentPriceListener } from './current-price.listener';
import { CurrentPriceMapper } from './current-price.mapper';
import { CurrentPriceRepository } from './current-price.repository';
import { CurrentPriceService } from './current-price.service';
import { CurrentPrice } from './entity/current-price.entity';
import { SymbolModule } from '../symbol/symbol.module';
import { TokenOrder } from './entity/token-order.entity';
import { ChronoPriceModule } from '../chrono-price/chrono-price.module';

@Module({
  imports: [
    HttpModule,
    SymbolModule,
    ChronoPriceModule,
    TypeOrmModule.forFeature([CurrentPrice, TokenOrder]),
  ],
  controllers: [],
  providers: [
    CurrentPriceService,
    CurrentPriceListener,
    CurrentPriceRepository,
    CurrentPriceMapper,
  ],
  exports: [CurrentPriceService],
})
export class CurrentPriceModule {}
