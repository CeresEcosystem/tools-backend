import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenPriceSync } from './token-price.sync';
import { TokenPriceBcDtoToEntityMapper } from './mapper/token-price.mapper';
import { TokenPriceRepository } from './token-price.repository';
import { TokenPriceService } from './token-price.service';
import { TokenPrice } from './entity/token-price.entity';
import { SymbolModule } from '../symbol/symbol.module';
import { TokenOrder } from './entity/token-order.entity';
import { ChronoPriceModule } from '../chrono-price/chrono-price.module';
import { TokenPriceController } from './token-price.controller';
import { TokenPriceToDtoMapper } from './mapper/token-price-to-dto.mapper';

@Module({
  imports: [
    HttpModule,
    SymbolModule,
    ChronoPriceModule,
    TypeOrmModule.forFeature([TokenPrice, TokenOrder]),
  ],
  controllers: [TokenPriceController],
  providers: [
    TokenPriceService,
    TokenPriceSync,
    TokenPriceRepository,
    TokenPriceBcDtoToEntityMapper,
    TokenPriceToDtoMapper,
  ],
  exports: [TokenPriceService],
})
export class TokenPriceModule {}