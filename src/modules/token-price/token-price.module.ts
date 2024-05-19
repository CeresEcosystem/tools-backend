import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenPriceSync } from './token-price.sync';
import { TokenPriceBcDtoToEntityMapper } from './mapper/token-price.mapper';
import { TokenPriceRepository } from './token-price.repository';
import { TokenPriceService } from './token-price.service';
import { TokenPrice } from './entity/token-price.entity';
import { SymbolsModule } from '../symbols/symbols.module';
import { ChronoPriceModule } from '../chrono-price/chrono-price.module';
import { TokenPriceController } from './token-price.controller';
import { TokenPriceToDtoMapper } from './mapper/token-price-to-dto.mapper';
import { CeresClientModule } from '../ceres-client/ceres-client.module';
import { TokenLockerSync } from './token-locker.sync';
import { TokenOrderModule } from '../token-order/token-order.module';
import { SoraClientModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [
    HttpModule,
    SymbolsModule,
    ChronoPriceModule,
    CeresClientModule,
    TokenOrderModule,
    SoraClientModule,
    TypeOrmModule.forFeature([TokenPrice]),
  ],
  controllers: [TokenPriceController],
  providers: [
    TokenPriceService,
    TokenPriceSync,
    TokenPriceRepository,
    TokenPriceBcDtoToEntityMapper,
    TokenPriceToDtoMapper,
    TokenLockerSync,
  ],
  exports: [TokenPriceService],
})
export class TokenPriceModule {}
