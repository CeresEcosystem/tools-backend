import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservesRepository } from './reserves.repository';
import { Reserve } from './entity/reserves.entity';
import { CRON_DISABLED, RESERVE_ADDRESS } from 'src/constants/constants';
import { PortfolioService } from '../portfolio/portfolio.service';
import { ReservesDto } from './dto/reserves.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CACHE_KEYS } from './reserves.const';
import { ReservesHistoryDto } from './dto/reserves-history.dto';
import { plainToInstance } from 'class-transformer';

const RESERVES = ['TBCD', 'ETH', 'DAI', 'VAL', 'PSWAP'];

@Injectable()
export class ReservesService {
  private readonly logger = new Logger(ReservesService.name);

  constructor(
    private readonly reserveRepo: ReservesRepository,
    private readonly portfolioService: PortfolioService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  public async getTokensReserves(tokenSymbol: string): Promise<ReservesDto> {
    const portfolio = await this.portfolioService.getPortfolio(RESERVE_ADDRESS);
    const [tokenReserve] = portfolio.filter(
      (token) => token.token === tokenSymbol,
    );
    const dataHistoryEntities = await this.reserveRepo.findTokenReserves(
      tokenSymbol,
    );
    const dataHistoryDtos = plainToInstance(
      ReservesHistoryDto,
      dataHistoryEntities,
      {
        excludeExtraneousValues: true,
      },
    );

    const reserveDto: ReservesDto = {
      currentBalance: tokenReserve.balance,
      currentValue: tokenReserve.value,
      data: dataHistoryDtos,
    };

    return reserveDto;
  }

  @Cron(CronExpression.EVERY_6_HOURS, { disabled: CRON_DISABLED })
  private async updateReserves(): Promise<void> {
    this.logger.log('Start updating token reserves');
    const portfolio = await this.portfolioService.getPortfolio(RESERVE_ADDRESS);

    const tokenReserves = portfolio.filter((token) =>
      RESERVES.includes(token.token),
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

    this.cacheManager.del(CACHE_KEYS.RESERVES);

    this.logger.log('Token reserves updated');
  }

  public async insert(reserve: Reserve): Promise<void> {
    await this.reserveRepo.saveReserve(reserve);
  }
}
