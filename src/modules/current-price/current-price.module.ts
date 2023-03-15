import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrentPriceListener } from './current-price.listener';
import { CurrentPriceBcDtoToEntityMapper } from './mapper/current-price.mapper';
import { CurrentPriceRepository } from './current-price.repository';
import { CurrentPriceService } from './current-price.service';
import { CurrentPrice } from './entity/current-price.entity';
import { SymbolModule } from '../symbol/symbol.module';
import { TokenOrder } from './entity/token-order.entity';
import { ChronoPriceModule } from '../chrono-price/chrono-price.module';
import { CurrentPriceController } from './current-price.controller';
import { CurrentPriceToDtoMapper } from './mapper/current-price-to-dto.mapper';

@Module({
  imports: [
    HttpModule,
    SymbolModule,
    ChronoPriceModule,
    TypeOrmModule.forFeature([CurrentPrice, TokenOrder]),
  ],
  controllers: [CurrentPriceController],
  providers: [
    CurrentPriceService,
    CurrentPriceListener,
    CurrentPriceRepository,
    CurrentPriceBcDtoToEntityMapper,
    CurrentPriceToDtoMapper,
  ],
  exports: [CurrentPriceService],
})
export class CurrentPriceModule {}
