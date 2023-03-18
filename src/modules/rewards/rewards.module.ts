import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsSync } from './rewards.sync';
import { RewardsService } from './rewards.service';
import { KeyValueData } from './key-value-data.entity';
import { RewardsController } from './rewards.controller';
import { PairsModule } from '../pairs/pairs.module';
import { TokenPriceModule } from '../token-price/token-price.module';

@Module({
  imports: [
    HttpModule,
    TokenPriceModule,
    PairsModule,
    TypeOrmModule.forFeature([KeyValueData]),
  ],
  controllers: [RewardsController],
  providers: [RewardsService, RewardsSync],
  exports: [],
})
export class RewardsModule {}
