import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChronoPriceService } from './chrono-price.service';
import { ChronoPrice } from './entity/chrono-price.entity';
import { ChronoPriceAgg } from './entity/chrono-price-agg.entity';
import { ChronoPriceCacheService } from './chrono-price-cache.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChronoPrice, ChronoPriceAgg], 'pg')],
  controllers: [],
  providers: [ChronoPriceService, ChronoPriceCacheService],
  exports: [ChronoPriceService],
})
export class ChronoPriceModule {}
