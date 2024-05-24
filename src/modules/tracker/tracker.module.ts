import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackerSupply } from './entity/tracker-supply.entity';
import { TrackerSupplySync } from './tracker-supply.sync';
import { TrackerSupplyRepository } from './tracker-supply.repository';
import { TrackerController } from './tracker.controller';
import { TrackerService } from './tracker.service';
import { Tracker } from './entity/tracker.entity';
import { TrackerPswapSync } from './tracker-pswap.sync';
import { PSWAPTrackerBlockBcToEntityMapper } from './mapper/pswap-tracker-to-entity.mapper';
import { TrackerValSync } from './tracker-val.sync';
import { TokenPriceModule } from '../token-price/token-price.module';
import { ValFeesTrackerBlockBcToEntityMapper } from './mapper/val-fees-tracker-to-entity.mapper';
import { ValTbcTrackerToEntityMapper } from './mapper/val-tbc-tracker-to-entity.mapper';
import { TrackerValTbcBurningsListener } from './tracker-val-tbc-burning.listener';
import { TrackerBurn } from './entity/tracker-burn.entity';
import { TrackerBurnService } from './tracker-burn.service';
import { TrackerSummaryService } from './tracker-summary.service';
import { TrackerSummary } from './entity/tracker-summary.entity';
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
