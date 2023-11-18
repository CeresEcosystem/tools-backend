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
import { TokenSupplySeeder } from './seeder/token-supply-seeder';
import { ValFeesTrackerBlockBcToEntityMapper } from './mapper/val-fees-tracker-to-entity.mapper';
import { ValTbcTrackerToEntityMapper } from './mapper/val-tbc-tracker-to-entity.mapper';
import { TrackerValTbcBurningsListener } from './tracker-val-tbc-burning.listener';
import { SoraClientModule } from '../sora-client/sora-client-module';

@Module({
  imports: [
    HttpModule,
    SoraClientModule,
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
    ValFeesTrackerBlockBcToEntityMapper,
    TokenSupplySeeder,
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
