import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CurrentPrice } from './entity/current-price.entity';

@Injectable()
export class CurrentPriceRepository {
  private readonly logger = new Logger(CurrentPriceRepository.name);

  constructor(
    @InjectRepository(CurrentPrice)
    private readonly repository: Repository<CurrentPrice>,
  ) {}

  public async find(
    options: FindManyOptions<CurrentPrice>,
  ): Promise<CurrentPrice[]> {
    return this.repository.find(options);
  }

  public async upsertAll(tokenPrices: CurrentPrice[]) {
    tokenPrices.forEach((tokenPrice) => {
      this.upsert(tokenPrice);
    });
  }

  private async upsert(tokenPrice: CurrentPrice) {
    tokenPrice.updatedAt = new Date();

    const existingPrice = await this.repository.findOneBy({
      token: tokenPrice.token,
    });

    if (!existingPrice) {
      this.repository.insert(tokenPrice);

      return;
    }

    this.repository.update(
      {
        token: tokenPrice.token,
      },
      tokenPrice,
    );
  }
}
