import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiquidityPair } from './pairs.entity';
import { PairsSync } from './pairs.sync';
import { PairsMapper } from './pairs.mapper';
import { PairsRepository } from './pairs.repository';
import { PairsService } from './pairs.service';
import { TokenPriceModule } from '../token-price/token-price.module';

@Module({
  imports: [
    HttpModule,
    TokenPriceModule,
    TypeOrmModule.forFeature([LiquidityPair]),
  ],
  controllers: [],
  providers: [PairsService, PairsMapper, PairsRepository, PairsSync],
  exports: [],
})
export class PairsModule {}
