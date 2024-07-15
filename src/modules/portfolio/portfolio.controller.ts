import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Inject,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioExtendedDto } from './dto/portfolio.dto';
import { StakingDto } from './dto/staking.dto';
import { LiquidityDto } from './dto/liquidity.dto';
import { SwapDto } from '../swaps/dto/swap.dto';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerBehindProxyGuard } from 'src/guards/throttler-behind-proxy.guard';
import { TransferDto } from '../transfers/dto/transfer.dto';
import { TransfersService } from '../transfers/transfers.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CACHE_KEYS, CACHE_TTL } from './portfolio.const';
import { AccountIdValidator } from 'src/utils/validators/account-id.validator';
import {
  PageOptionsDto,
  PageDto,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { PortfolioChartQuery } from './dto/portfolio-chart-query.dto';
import { PortfolioHistoryService } from './portfolio.history.service';
import { PortfolioChartDto } from './dto/portfolio-chart.dto';
import { KensetsuPositionDto } from './dto/kensetsu-position.dto';

@Controller('portfolio')
@ApiTags('Portfolio Controller')
@UseGuards(ThrottlerBehindProxyGuard)
export class PortfolioController {
  constructor(
    private portfolioService: PortfolioService,
    private portfolioHistoryService: PortfolioHistoryService,
    private transfersService: TransfersService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Get(':accountId/history')
  public getPortfolioValueHistory(
    @Param('accountId', AccountIdValidator) accountId: string,
    @Query() queryParams: PortfolioChartQuery,
  ): Promise<PortfolioChartDto> {
    return this.portfolioHistoryService.getChartData(accountId, queryParams);
  }

  @Get(':accountId')
  getPortfolio(
    @Param('accountId', AccountIdValidator) accountId: string,
  ): Promise<PortfolioExtendedDto[]> {
    return this.cacheManager.wrap(
      `${CACHE_KEYS.PORTFOLIO}-${accountId}`,
      () => this.portfolioService.getPortfolioExtended(accountId),
      CACHE_TTL.FIVE_MINUTES,
    );
  }

  @Get('staking/:accountId')
  getStaked(
    @Param('accountId', AccountIdValidator) accountId: string,
  ): Promise<StakingDto[]> {
    return this.cacheManager.wrap(
      `${CACHE_KEYS.STAKING_PORTFOLIO}-${accountId}`,
      () => this.portfolioService.getStakingPortfolio(accountId),
      CACHE_TTL.FIVE_MINUTES,
    );
  }

  @Get('rewards/:accountId')
  getRewards(
    @Param('accountId', AccountIdValidator) accountId: string,
  ): Promise<StakingDto[]> {
    return this.cacheManager.wrap(
      `${CACHE_KEYS.REWARDS_PORTFOLIO}-${accountId}`,
      () => this.portfolioService.getRewardsPortfolio(accountId),
      CACHE_TTL.FIVE_MINUTES,
    );
  }

  @Get('liquidity/:accountId')
  getLiquidity(
    @Param('accountId', AccountIdValidator) accountId: string,
  ): Promise<LiquidityDto[]> {
    return this.cacheManager.wrap(
      `${CACHE_KEYS.LIQUIDITY_PORTFOLIO}-${accountId}`,
      () => this.portfolioService.getLiquidityPortfolio(accountId),
      CACHE_TTL.FIVE_MINUTES,
    );
  }

  @Get('swaps/:accountId')
  getSwaps(
    @Query() pageOptions: PageOptionsDto,
    @Param('accountId', AccountIdValidator) accountId: string,
  ): Promise<PageDto<SwapDto>> {
    return this.portfolioService.getSwapsPortfolio(pageOptions, accountId);
  }

  @Get('transfers/:accountId')
  getTransfers(
    @Query() pageOptions: PageOptionsDto,
    @Param('accountId', AccountIdValidator) accountId: string,
  ): Promise<PageDto<TransferDto>> {
    return this.transfersService.findTransfersByAccountId(
      pageOptions,
      accountId,
    );
  }

  @Get('kensetsu/:accountId')
  getKensetsu(
    @Query() pageOptions: PageOptionsDto,
    @Param('accountId', AccountIdValidator) accountId: string,
  ): Promise<PageDto<KensetsuPositionDto>> {
    return this.portfolioService.getKensetsuPortfolio(pageOptions, accountId);
  }
}
