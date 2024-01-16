import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrencyRate } from './entity/currency-rate.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CurrencyRateRepository {
  constructor(
    @InjectRepository(CurrencyRate)
    private readonly repository: Repository<CurrencyRate>,
  ) {}

  public findCurrencyRate(currency: string): Promise<CurrencyRate> {
    return this.repository.findOneByOrFail({ currency });
  }

  public upsertAll(currencyRates: CurrencyRate[]): void {
    currencyRates.forEach(async (currencyRate) => {
      await this.upsert(currencyRate);
    });
  }

  private async upsert(currencyRate: CurrencyRate): Promise<void> {
    currencyRate.updatedAt = new Date();

    const existingPair = await this.repository.findOneBy({
      currency: currencyRate.currency,
    });

    if (!existingPair) {
      await this.repository.insert(currencyRate);

      return;
    }

    await this.repository.update(
      {
        id: currencyRate.id,
      },
      currencyRate,
    );
  }
}
