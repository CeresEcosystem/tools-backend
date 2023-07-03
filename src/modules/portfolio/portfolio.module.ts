import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { TokenPriceModule } from '../token-price/token-price.module';
import { ChronoPriceModule } from '../chrono-price/chrono-price.module';
import { PairsModule } from '../pairs/pairs.module';
import { DeoClientModule } from '../deo-client/deo-client.module';

@Module({
  imports: [TokenPriceModule, ChronoPriceModule, PairsModule, DeoClientModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
