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
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisteredAccount } from './entity/registered-account.entity';
import { PortfolioTotalValueService } from './portfolio.total-value.service';
import { PortfolioValue } from './entity/portfolio-value.entity';
import { PortfolioRegisteredAccountService } from './portfolio.reg-acc.service';

@Module({
  imports: [
    TokenPriceModule,
    ChronoPriceModule,
    PairsModule,
    DeoClientModule,
    SwapsModule,
    SoraClientModule,
    TransfersModule,
    TypeOrmModule.forFeature([RegisteredAccount]),
    TypeOrmModule.forFeature([PortfolioValue], 'pg'),
  ],
  controllers: [PortfolioController],
  providers: [
    PortfolioService,
    PortfolioTotalValueService,
    PortfolioRegisteredAccountService,
  ],
  exports: [PortfolioService, PortfolioRegisteredAccountService],
})
export class PortfolioModule {}
