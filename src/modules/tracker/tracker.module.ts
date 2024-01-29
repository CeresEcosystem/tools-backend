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
import { PSWAPTrackerBlockBcToEntityMapper } from './mapper/pswap-tracker-to-entity.mapper';
import { TrackerValSync } from './tracker-val.sync';
import { TokenPriceModule } from '../token-price/token-price.module';
import { ValFeesTrackerBlockBcToEntityMapper } from './mapper/val-fees-tracker-to-entity.mapper';
import { ValTbcTrackerToEntityMapper } from './mapper/val-tbc-tracker-to-entity.mapper';
import { TrackerValTbcBurningsListener } from './tracker-val-tbc-burning.listener';
import { SoraClientModule } from '../sora-client/sora-client-module';
import { TrackerBurn } from './entity/tracker-burn.entity';
import { TrackerBurnService } from './tracker-burn.service';
import { TrackerBurnToDtoMapper } from './mapper/tracker-burn-to-dto.mapper';
import { TrackerSummaryService } from './tracker-summary.service';
import { TrackerSummary } from './entity/tracker-summary.entity';

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
    TrackerToBlockDtoMapper,
    TrackerSupplyRepository,
    TrackerSupplySync,
    TrackerPswapSync,
    TrackerValSync,
    PSWAPTrackerBlockBcToEntityMapper,
    ValFeesTrackerBlockBcToEntityMapper,
    TrackerValTbcBurningsListener,
    ValTbcTrackerToEntityMapper,
    TrackerBurnToDtoMapper,
  ],
  exports: [
    TrackerService,
    ValFeesTrackerBlockBcToEntityMapper,
    TrackerSupplyRepository,
  ],
})
export class TrackerModule {}
