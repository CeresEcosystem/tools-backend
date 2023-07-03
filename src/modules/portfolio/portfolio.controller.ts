import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioDto } from './dto/portfolio.dto';
import { StakingDto } from './dto/staking.dto';
import { LiquidityDto } from './dto/liquidity.dto';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerBehindProxyGuard } from 'src/guards/throttler-behind-proxy.guard';

@Controller('portfolio')
@ApiTags('Portfolio Controller')
@UseGuards(ThrottlerBehindProxyGuard)
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @Get(':accountId')
  getPortfolio(@Param('accountId') accountId: string): Promise<PortfolioDto[]> {
    return this.portfolioService.getPortfolio(accountId);
  }

  @Get('staking/:accountId')
  getStaked(@Param('accountId') accountId: string): Promise<StakingDto[]> {
    return this.portfolioService.getStakingPortfolio(accountId);
  }

  @Get('rewards/:accountId')
  getRewards(@Param('accountId') accountId: string): Promise<StakingDto[]> {
    return this.portfolioService.getRewardsPortfolio(accountId);
  }

  @Get('liquidity/:accountId')
  getLiquidity(@Param('accountId') accountId: string): Promise<LiquidityDto[]> {
    return this.portfolioService.getLiquidityPortfolio(accountId);
  }
}
