import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiquidityPair } from './liquidity-pairs.entity';
import { LiquidityPairsMapper } from './liquidity-pairs.mapper';
import { LiquidityPairsService } from './liquidity-pairs.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([LiquidityPair])],
  controllers: [],
  providers: [LiquidityPairsService, LiquidityPairsMapper],
  exports: [],
})
export class LiquidityPairsModule {}
