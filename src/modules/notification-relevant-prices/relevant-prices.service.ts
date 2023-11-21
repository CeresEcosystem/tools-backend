import { Injectable } from '@nestjs/common';
import { RelevantPricesRepository } from './relevant-prices.repository';
import { RelevantPrices } from './entity/relevant-prices.entity';

@Injectable()
export class RelevantPricesService {
  constructor(private relevantPricesRepo: RelevantPricesRepository) {}

  public findRelevantToken(tokenName: string): Promise<RelevantPrices> {
    return this.relevantPricesRepo.findToken(tokenName);
  }

  public findAllRelevantTokens(): Promise<RelevantPrices[]> {
    return this.relevantPricesRepo.findAll();
  }

  public saveRelevantToken(token: RelevantPrices): Promise<RelevantPrices> {
    return this.relevantPricesRepo.saveToken(token);
  }
}
