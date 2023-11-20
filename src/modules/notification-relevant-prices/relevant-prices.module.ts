import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelevantPrices } from './entity/relevant-prices.entity';
import { RelevantPricesRepository } from './relevant-prices.repository';
import { RelevantPricesInit } from './relevant-prices.init';
import { TokenPriceModule } from '../token-price/token-price.module';

@Module({
  imports: [TypeOrmModule.forFeature([RelevantPrices]), TokenPriceModule],
  controllers: [],
  providers: [RelevantPricesRepository, RelevantPricesInit],
  exports: [RelevantPricesRepository],
})
export class RelevantPricesModule {}
