import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiquidityPair } from './liquidity-pairs.entity';
import { LiquidityPairsListener } from './liquidity-pairs.listener';
import { LiquidityPairsMapper } from './liquidity-pairs.mapper';
import { LiquidityPairsRepository } from './liquidity-pairs.repository';
import { LiquidityPairsService } from './liquidity-pairs.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([LiquidityPair])],
  controllers: [],
  providers: [
    LiquidityPairsService,
    LiquidityPairsMapper,
    LiquidityPairsRepository,
    LiquidityPairsListener,
  ],
  exports: [],
})
export class LiquidityPairsModule {}
