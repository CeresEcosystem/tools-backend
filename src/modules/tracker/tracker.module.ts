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
import { TrackerSync } from './tracker.sync';
import { TrackerBlockBcToEntityMapper } from './mapper/tracker-block-bc-to-entity.mapper';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Tracker, TrackerSupply])],
  controllers: [TrackerController],
  providers: [
    TrackerService,
    TrackerToBlockDtoMapper,
    TrackerSupplyRepository,
    TrackerSupplySync,
    TrackerSync,
    TrackerBlockBcToEntityMapper,
  ],
  exports: [],
})
export class TrackerModule {}
