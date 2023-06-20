import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackerSupply } from './entity/tracker-supply.entity';
import { TrackerSupplySync } from './tracker-supply.sync';
import { TrackerSupplyRepository } from './tracker-supply.repository';
import { TrackerController } from './tracker.controller';
import { TrackerService } from './tracker.service';
import { TrackerToBlockDtoMapper } from './mapper/tracker-to-block-dto.mapper';
import { Tracker } from './entity/tracker.entity';
import { TrackerPswapSync } from './tracker-pswap.sync';
import { PSWAPTrackerBlockBcToEntityMapper } from './mapper/pswap-tracker-block-bc-to-entity.mapper';
import { TrackerValSync } from './tracker-val.sync';
import { VALTrackerBlockBcToEntityMapper } from './mapper/val-tracker-block-bc-to-entity.mapper';
import { TokenPriceModule } from '../token-price/token-price.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Tracker, TrackerSupply]),
    TokenPriceModule,
  ],
  controllers: [TrackerController],
  providers: [
    TrackerService,
    TrackerToBlockDtoMapper,
    TrackerSupplyRepository,
    TrackerSupplySync,
    TrackerPswapSync,
    TrackerValSync,
    PSWAPTrackerBlockBcToEntityMapper,
    VALTrackerBlockBcToEntityMapper,
  ],
  exports: [
    TrackerService,
    VALTrackerBlockBcToEntityMapper,
    TrackerSupplyRepository,
  ],
})
export class TrackerModule {}
