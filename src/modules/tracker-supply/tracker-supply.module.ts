import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackerSupply } from './tracker-supply.entity';
import { TrackerSupplySync } from './tracker-supply.sync';
import { TrackerSupplyService } from './tracker-supply.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([TrackerSupply])],
  controllers: [],
  providers: [TrackerSupplyService, TrackerSupplySync],
  exports: [],
})
export class TrackerSupplyModule {}
