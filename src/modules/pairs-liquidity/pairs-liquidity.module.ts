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
import { PairsModule } from '../pairs/pairs.module';
import { PairPeriodicLiquidityChangeEntity } from './entity/pair-periodic-liquidity-change.entity';
import { PairsPeriodicLiquidityChangeRepository } from './periodic-liquidity-change.repository';
import { PairPeriodicLiquidityChangeEntityToDtoMapper } from './mapper/pair-periodic-liquidity-change-entity-to-dto';
import { SoraClientModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [
    HttpModule,
    SoraClientModule,
    PairsModule,
    TypeOrmModule.forFeature([
      PairLiquidityChangeEntity,
      PairPeriodicLiquidityChangeEntity,
    ]),
  ],
  controllers: [PairsLiquidityController],
  providers: [
    PairsLiquidityListener,
    PairsLiquidityService,
    PairsLiquidityRepository,
    PairLiquidityChangeEntityToDtoMapper,
    PairLiquidityChangeDataDtoToEntityMapper,
    PairPeriodicLiquidityChangeEntityToDtoMapper,
    PairsPeriodicLiquidityChangeRepository,
  ],
})
export class PairsLiquidityModule {}
