import { Injectable } from '@nestjs/common';
import { RelevantPricesRepository } from './relevant-prices.repository';
import { RelevantPrices } from './entity/relevant-prices.entity';

@Injectable()
export class RelevantPricesService {
  constructor(private relevantPricesRepo: RelevantPricesRepository) {}

  public async findRelevantToken(tokenName: string): Promise<RelevantPrices> {
    return this.relevantPricesRepo.findToken(tokenName);
  }

  public async findAllRelevantTokens(): Promise<RelevantPrices[]> {
    return this.relevantPricesRepo.findAll();
  }

  public async saveRelevantToken(
    token: RelevantPrices,
  ): Promise<RelevantPrices> {
    return this.relevantPricesRepo.saveToken(token);
  }
}
