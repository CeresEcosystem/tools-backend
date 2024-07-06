import { Injectable, Logger } from '@nestjs/common';
import { RegisteredAccount } from './entity/registered-account.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PortfolioRegisteredAccountService {
  private readonly logger = new Logger(PortfolioRegisteredAccountService.name);

  constructor(
    @InjectRepository(RegisteredAccount)
    private registeredAccountRepo: Repository<RegisteredAccount>,
  ) {}

  public getRegisteredAccounts(): Promise<RegisteredAccount[]> {
    return this.registeredAccountRepo.find();
  }

  public async registerAccountsIfNeeded(accountIds: string[]): Promise<void> {
    await Promise.all(accountIds.map(this.registerAccountIfNeeded.bind(this)));
  }

  public async registerAccountIfNeeded(accountId: string): Promise<void> {
    const isRegistered = await this.registeredAccountRepo.existsBy({
      accountId,
    });

    if (!isRegistered) {
      await this.registeredAccountRepo.insert({ accountId });
      this.logger.debug(`Registered new account ${accountId}`);
    }
  }
}
