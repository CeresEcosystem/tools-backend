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
import { CeresClientModule } from '../ceres-client/ceres-client.module';
import { PairsLockerSync } from './pairs-locker.sync';
import { PairsLiquidityChangesListener } from './pairs-liquidity-changes.listener';
import { PairLiquidityChangeEntity } from './entity/pair-liquidity-change.entity';
import { PairsLiquidityChangesService } from './pairs-liquidity-changes.service';
import { PairsLiquidityChangesRepository } from './pairs-liquidity-changes.repository';
import { PairLiquidityEntityToDtoMapper } from './mapper/pair-liquidity-entity-to-dto.mapper';
import { PairLiquidityChangeDataDtoToEntityMapper } from './mapper/pair-liquidity-change-data-dto-to-entity.mapper';

@Module({
  imports: [
    HttpModule,
    TokenPriceModule,
    CeresClientModule,
    TypeOrmModule.forFeature([Pair]),
    TypeOrmModule.forFeature([PairLiquidityChangeEntity]),
  ],
  controllers: [PairsController],
  providers: [
    PairsService,
    PairsMapper,
    PairToDtoMapper,
    PairsRepository,
    PairsSync,
    PairsLockerSync,
    PairsLiquidityChangesListener,
    PairsLiquidityChangesService,
    PairsLiquidityChangesRepository,
    PairLiquidityEntityToDtoMapper,
    PairLiquidityChangeDataDtoToEntityMapper,
  ],
  exports: [PairsService],
})
export class PairsModule {}
