import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackerSupply } from './entity/tracker-supply.entity';
import { TrackerSupplySync } from './tracker-supply.sync';
import { TrackerSupplyService } from './tracker-supply.service';
import { TrackerController } from './tracker.controller';
import { TrackerService } from './tracker.service';
import { TrackerToBlockDtoMapper } from './mapper/tracker-to-block-dto.mapper';
import { Tracker } from './entity/tracker.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Tracker, TrackerSupply])],
  controllers: [TrackerController],
  providers: [
    TrackerService,
    TrackerToBlockDtoMapper,
    TrackerSupplyService,
    TrackerSupplySync,
  ],
  exports: [],
})
export class TrackerModule {}
