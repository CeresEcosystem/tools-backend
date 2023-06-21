import { Controller, Get, Param } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioDto } from './dto/portfolio.dto';
import { StakingDto } from './dto/staking.dto';
import { LiquidtyDto } from './dto/liquidity.dto';

@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  // @Get(':accountId')
  // getPortfolio(@Param('accountId') accountId: string): Promise<PortfolioDto[]> {
  //   return this.portfolioService.getPortfolio(accountId);
  // }

  @Get('stake/:accountId')
  getStaked(@Param('accountId') accountId: string): Promise<StakingDto[]> {
    return this.portfolioService.getStakingPortfolio(accountId);
  }

  @Get('rewards/:accountId')
  getRewards(@Param('accountId') accountId: string): Promise<StakingDto[]> {
    return this.portfolioService.getRewardsPortfolio(accountId);
  }

  @Get('liquidity/:accountId')
  getLiquidity(@Param('accountId') accountId: string): Promise<LiquidtyDto[]> {
    return this.portfolioService.getLiquidityPortfolio(accountId);
  }
}
