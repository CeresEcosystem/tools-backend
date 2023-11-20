import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PairsLiquidityController } from './pairs-liquidity.controller';
import { PairLiquidityChangeEntity } from './entity/pair-liquidity-change.entity';
import { PairsLiquidityListener } from './pairs-liquidity.listener';
import { PairsLiquidityService } from './pairs-liquidity.service';
import { PairsLiquidityRepository } from './pairs-liquidity.repository';
import { PairLiquidityChangeEntityToDtoMapper } from './mapper/pair-liquidity-change-entity-to-dto.mapper';
import { PairLiquidityChangeDataDtoToEntityMapper } from './mapper/pair-liquidity-change-data-dto-to-entity.mapper';
import { SoraClientModule } from '../sora-client/sora-client-module';

@Module({
  imports: [
    HttpModule,
    SoraClientModule,
    TypeOrmModule.forFeature([PairLiquidityChangeEntity]),
  ],
  controllers: [PairsLiquidityController],
  providers: [
    PairsLiquidityListener,
    PairsLiquidityService,
    PairsLiquidityRepository,
    PairLiquidityChangeEntityToDtoMapper,
    PairLiquidityChangeDataDtoToEntityMapper,
  ],
})
export class PairsLiquidityModule {}
