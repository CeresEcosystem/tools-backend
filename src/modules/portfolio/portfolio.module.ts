import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { TokenPriceModule } from '../token-price/token-price.module';
import { ChronoPriceModule } from '../chrono-price/chrono-price.module';

@Module({
  imports: [TokenPriceModule, ChronoPriceModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
