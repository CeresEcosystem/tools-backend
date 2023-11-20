import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RelevantPrices } from './entity/relevant-prices.entity';

@Injectable()
export class RelevantPricesRepository {
  constructor(
    @InjectRepository(RelevantPrices)
    private relevantPricesRepo: Repository<RelevantPrices>,
  ) {}

  findToken(tokenName: string): Promise<RelevantPrices> {
    return this.relevantPricesRepo.findOne({
      where: {
        token: tokenName,
      },
    });
  }

  findAll(): Promise<RelevantPrices[]> {
    return this.relevantPricesRepo.find();
  }

  saveToken(token: RelevantPrices): Promise<RelevantPrices> {
    return this.relevantPricesRepo.save(token);
  }
}
