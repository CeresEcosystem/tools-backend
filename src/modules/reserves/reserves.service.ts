import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { ReservesRepository } from './reserves.repository';
import { Reserve } from './entity/reserves.entity';
import { RESERVE_ADDRESS } from 'src/constants/constants';
import { PortfolioService } from '../portfolio/portfolio.service';

const reserves = ['TBCD', 'ETH', 'DAI', 'VAL', 'PSWAP'];

@Injectable()
export class ReservesService {
  private readonly logger = new Logger(ReservesService.name);

  constructor(
    private reserveRepo: ReservesRepository,
    private readonly portfolioService: PortfolioService,
  ) {}

  public getTokensReserves(tokenSymbol: string): Promise<Reserve[]> {
    return this.reserveRepo.findTokenReserves(tokenSymbol);
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  private async updateReserves(): Promise<void> {
    this.logger.log('Start updating token reserves');
    const portfolio = await this.portfolioService.getPortfolio(RESERVE_ADDRESS);

    const tokenReserves = portfolio.filter((token) =>
      reserves.includes(token.token),
    );

    tokenReserves.forEach((tokenReserve) => {
      const reserve = new Reserve();
      reserve.tokenName = tokenReserve.fullName;
      reserve.tokenSymbol = tokenReserve.token;
      reserve.balance = tokenReserve.balance;
      reserve.value = tokenReserve.value;
      reserve.updatedAt = new Date();
      this.reserveRepo.saveReserve(reserve);
    });

    this.logger.log('Token reserves updated');
  }
}