import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { TokenPriceModule } from '../token-price/token-price.module';
import { ChronoPriceModule } from '../chrono-price/chrono-price.module';
import { PairsModule } from '../pairs/pairs.module';
import { DeoClientModule } from '../deo-client/deo-client.module';
import { SwapsModule } from '../swaps/swaps.module';
import { TransfersModule } from '../transfers/transfers.module';
import { SoraClientModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [
    TokenPriceModule,
    ChronoPriceModule,
    PairsModule,
    DeoClientModule,
    SwapsModule,
    SoraClientModule,
    TransfersModule,
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
