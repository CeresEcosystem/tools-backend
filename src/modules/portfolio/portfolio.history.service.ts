/* eslint-disable no-await-in-loop */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { PortfolioService } from './portfolio.service';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { PortfolioRegisteredAccountService } from './portfolio.reg-acc.service';
import { PortfolioValue } from './entity/portfolio-value.entity';
import { RegisteredAccount } from './entity/registered-account.entity';
import { PortfolioChartQuery } from './dto/portfolio-chart-query.dto';
import { PortfolioChartDto } from './dto/portfolio-chart.dto';
import { isNumberString } from 'class-validator';
import { PORTFOLIO_VALUE_HISTORY_QUERY } from './portfolio.const';
import { CRON_DISABLED } from 'src/constants/constants';

const BATCH_SIZE = 200;

@Injectable()
export class PortfolioHistoryService {
  private readonly logger = new Logger(PortfolioHistoryService.name);

  constructor(
    private portfolioService: PortfolioService,
    private registeredAccountService: PortfolioRegisteredAccountService,
    @InjectRepository(PortfolioValue, 'pg')
    private portfolioValueRepo: Repository<PortfolioValue>,
    @InjectDataSource('pg')
    private readonly dataSource: DataSource,
  ) {}

  public getChartData(
    accountId: string,
    queryParams: PortfolioChartQuery,
  ): Promise<PortfolioChartDto[]> {
    const params = this.buildQueryParams(
      accountId,
      queryParams.resolution,
      queryParams.from,
      queryParams.to,
    );

    return this.dataSource.query(PORTFOLIO_VALUE_HISTORY_QUERY, params);
  }

  @Cron(CronExpression.EVERY_5_MINUTES, {
    disabled: CRON_DISABLED || Boolean(process.env.PORTFOLIO_HISTORY_DISABLED),
  })
  public async storePortfolioTotalValues(): Promise<void> {
    this.logger.log(
      'Start portfolio value calculation for all registered accounts',
    );
    const start = Date.now();

    const registeredAccounts =
      await this.registeredAccountService.getRegisteredAccounts();

    const registeredAccountsBatch: RegisteredAccount[][] = [];

    for (let i = 0; i < registeredAccounts.length; i += BATCH_SIZE) {
      registeredAccountsBatch.push(registeredAccounts.slice(i, i + BATCH_SIZE));
    }

    for (const accountBatch of registeredAccountsBatch) {
      const portfolioValues: PortfolioValue[] = (
        await Promise.all(accountBatch.map(this.calcPortfolioValue.bind(this)))
      ).filter((account) => account.value > 0);

      await this.portfolioValueRepo.insert(portfolioValues);
    }

    this.logger.log(
      `Portfolio value calculated for all ${
        registeredAccounts.length
      } accounts in ${(Date.now() - start) / 1000}sec.`,
    );
  }

  private async calcPortfolioValue(
    account: RegisteredAccount,
  ): Promise<PortfolioValue> {
    const { accountId } = account;
    const portfolioAssets = await this.portfolioService.getPortfolio(accountId);

    const value = portfolioAssets.reduce(
      (partialSum, asset) => partialSum + asset.value,
      0,
    );

    return { accountId, value } as PortfolioValue;
  }

  private buildQueryParams(
    accountId: string,
    resolution: string,
    from: number,
    to: number,
  ): string[] {
    return [
      this.resolveResolution(resolution),
      accountId,
      from.toString(),
      to.toString(),
    ];
  }

  private resolveResolution(resolution: string): string {
    if (isNumberString(resolution)) {
      return `${resolution}m`;
    }

    return resolution;
  }
}
