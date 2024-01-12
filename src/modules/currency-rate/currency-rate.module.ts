import { Module } from '@nestjs/common';
import { CurrencyRateController } from './currency-rate.controller';
import { CurrencyRateRepository } from './currency-rate.repository';
import { CurrencyRateService } from './currency-rate.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyRate } from './entity/currency-rate.entity';
import { CurrencyRateToEntityMapper } from './mapper/currency-rate-to-entity.mapper';
import { CurrencyRateToDtoMapper } from './mapper/currency-rate-to-dto.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyRate]), HttpModule],
  controllers: [CurrencyRateController],
  providers: [
    CurrencyRateRepository,
    CurrencyRateService,
    CurrencyRateToDtoMapper,
    CurrencyRateToEntityMapper,
  ],
})
export class CurrencyRateModule {}
