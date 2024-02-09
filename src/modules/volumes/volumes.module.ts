import { Module } from '@nestjs/common';
import { VolumesService } from './volumes.service';
import { SwapsModule } from '../swaps/swaps.module';
import { VolumesControler } from './volumes.controller';
import { ChronoPriceModule } from '../chrono-price/chrono-price.module';
import { TokenPriceModule } from '../token-price/token-price.module';

@Module({
  imports: [SwapsModule, ChronoPriceModule, TokenPriceModule],
  controllers: [VolumesControler],
  providers: [VolumesService],
  exports: [],
})
export class VolumesModule {}
