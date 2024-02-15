import { Module } from '@nestjs/common';
import { VolumesService } from './volumes.service';
import { SwapsModule } from '../swaps/swaps.module';
import { ChronoPriceModule } from '../chrono-price/chrono-price.module';
import { TokenPriceModule } from '../token-price/token-price.module';
import { TokenVolume } from './entity/volumes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    SwapsModule,
    ChronoPriceModule,
    TokenPriceModule,
    TypeOrmModule.forFeature([TokenVolume], 'pg'),
  ],
  providers: [VolumesService],
  exports: [VolumesService],
})
export class VolumesModule {}
