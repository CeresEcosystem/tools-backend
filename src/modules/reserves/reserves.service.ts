import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { ReservesRepository } from './reserves.repository';
import { Reserve } from './entity/reserves.entity';
import { RESERVE_ADDRESS } from 'src/constants/constants';
import { PortfolioService } from '../portfolio/portfolio.service';
import { ReservesDto } from './dto/reserves.dto';
import { ReserveEntityToDto } from './mapper/reserves-entity-to-dto.mapper';

const reserves = ['TBCD', 'ETH', 'DAI', 'VAL', 'PSWAP'];

@Injectable()
export class ReservesService {
  private readonly logger = new Logger(ReservesService.name);

  constructor(
    private reserveRepo: ReservesRepository,
    private readonly portfolioService: PortfolioService,
    private readonly reserveMapper: ReserveEntityToDto,
  ) {}

  public async getTokensReserves(tokenSymbol: string): Promise<ReservesDto> {
    const portfolio = await this.portfolioService.getPortfolio(RESERVE_ADDRESS);
    const [tokenReserve] = portfolio.filter(
      (token) => token.token === tokenSymbol,
    );
    const dataHistoryEntities = await this.reserveRepo.findTokenReserves(
      tokenSymbol,
    );
    const dataHistoryDtos = this.reserveMapper.toDtos(dataHistoryEntities);
    const reserveDto: ReservesDto = {
      currentBalance: tokenReserve.balance,
      currentValue: tokenReserve.value,
      data: dataHistoryDtos,
    };

    return reserveDto;
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
      reserve.balance = tokenReserve.balance.toString();
      reserve.value = tokenReserve.value;
      reserve.updatedAt = new Date();
      this.reserveRepo.saveReserve(reserve);
    });

    this.logger.log('Token reserves updated');
  }
}
