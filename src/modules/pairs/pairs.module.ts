import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pair } from './entity/pairs.entity';
import { PairsSync } from './pairs.sync';
import { PairsMapper } from './mapper/pairs.mapper';
import { PairsRepository } from './pairs.repository';
import { PairsService } from './pairs.service';
import { TokenPriceModule } from '../token-price/token-price.module';
import { PairsController } from './pairs.controller';
import { PairToDtoMapper } from './mapper/pair-to-dto.mapper';

@Module({
  imports: [HttpModule, TokenPriceModule, TypeOrmModule.forFeature([Pair])],
  controllers: [PairsController],
  providers: [
    PairsService,
    PairsMapper,
    PairToDtoMapper,
    PairsRepository,
    PairsSync,
  ],
  exports: [],
})
export class PairsModule {}
