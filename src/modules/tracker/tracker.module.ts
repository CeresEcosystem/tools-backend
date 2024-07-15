import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackerSupply } from './supply/entity/tracker-supply.entity';
import { TrackerSupplySync } from './supply/tracker-supply.sync';
import { TrackerSupplyRepository } from './supply/tracker-supply.repository';
import { TrackerController } from './tracker.controller';
import { TrackerService } from './tracker.service';
import { Tracker } from './burn/entity/tracker.entity';
import { TrackerPswapSync } from './burn/listeners/tracker-pswap.sync';
import { PSWAPTrackerBlockBcToEntityMapper } from './burn/mapper/pswap-tracker-to-entity.mapper';
import { TrackerValSync } from './burn/listeners/tracker-val.sync';
import { TokenPriceModule } from '../token-price/token-price.module';
import { ValFeesTrackerBlockBcToEntityMapper } from './burn/mapper/val-fees-tracker-to-entity.mapper';
import { ValTbcTrackerToEntityMapper } from './burn/mapper/val-tbc-tracker-to-entity.mapper';
import { TrackerValTbcBurningsListener } from './burn/listeners/tracker-val-tbc-burning.listener';
import { TrackerBurn } from './burn/entity/tracker-burn.entity';
import { TrackerBurnService } from './burn/tracker-burn.service';
import { TrackerSummaryService } from './burn/tracker-summary.service';
import { TrackerSummary } from './burn/entity/tracker-summary.entity';
import { SoraClientModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [
    HttpModule,
    SoraClientModule,
    TypeOrmModule.forFeature([
      Tracker,
      TrackerSupply,
      TrackerBurn,
      TrackerSummary,
    ]),
    TokenPriceModule,
  ],
  controllers: [TrackerController],
  providers: [
    TrackerService,
    TrackerBurnService,
    TrackerSummaryService,
    TrackerSupplyRepository,
    TrackerSupplySync,
    TrackerPswapSync,
    TrackerValSync,
    PSWAPTrackerBlockBcToEntityMapper,
    ValFeesTrackerBlockBcToEntityMapper,
    TrackerValTbcBurningsListener,
    ValTbcTrackerToEntityMapper,
  ],
  exports: [
    TrackerService,
    ValFeesTrackerBlockBcToEntityMapper,
    TrackerSupplyRepository,
  ],
})
export class TrackerModule {}
