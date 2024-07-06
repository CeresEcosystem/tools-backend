/* eslint-disable no-await-in-loop */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { PortfolioService } from './portfolio.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PortfolioRegisteredAccountService } from './portfolio.reg-acc.service';
import { PortfolioValue } from './entity/portfolio-value.entity';
import { RegisteredAccount } from './entity/registered-account.entity';

const BATCH_SIZE = 1000;

@Injectable()
export class PortfolioTotalValueService {
  private readonly logger = new Logger(PortfolioTotalValueService.name);

  constructor(
    private portfolioService: PortfolioService,
    private registeredAccountService: PortfolioRegisteredAccountService,
    @InjectRepository(PortfolioValue, 'pg')
    private portfolioValueRepo: Repository<PortfolioValue>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
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
}
