import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { TokenPriceModule } from '../token-price/token-price.module';
import { ChronoPriceModule } from '../chrono-price/chrono-price.module';
import { PairsModule } from '../pairs/pairs.module';
import { FarmingApiClientModule } from '../farming-api-client/farming-api-client.module';

@Module({
  imports: [
    TokenPriceModule,
    ChronoPriceModule,
    PairsModule,
    FarmingApiClientModule,
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
