import { Controller, Get, Param } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioDto } from './dto/portfolio.dto';

@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @Get(':accountId')
  getPortfolio(@Param('accountId') accountId: string): Promise<PortfolioDto[]> {
    return this.portfolioService.getPortfolio(accountId);
  }
}
