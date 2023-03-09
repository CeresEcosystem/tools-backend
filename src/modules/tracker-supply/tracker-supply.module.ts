import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackerSupply } from './tracker-supply.entity';
import { TrackerSupplyListener } from './tracker-supply.listener';
import { TrackerSupplyService } from './tracker-supply.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([TrackerSupply])],
  controllers: [],
  providers: [TrackerSupplyService, TrackerSupplyListener],
  exports: [],
})
export class TrackerSupplyModule {}
