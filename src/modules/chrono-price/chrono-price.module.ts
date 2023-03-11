import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChronoPriceService } from './chrono-price.service';
import { ChronoPrice } from './entity/chrono-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChronoPrice], 'pg')],
  controllers: [],
  providers: [ChronoPriceService],
  exports: [ChronoPriceService],
})
export class ChronoPriceModule {}
