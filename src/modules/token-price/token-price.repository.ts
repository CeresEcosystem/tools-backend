import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { TokenPrice } from './entity/token-price.entity';

@Injectable()
export class TokenPriceRepository {
  private readonly logger = new Logger(TokenPriceRepository.name);

  constructor(
    @InjectRepository(TokenPrice)
    private readonly repository: Repository<TokenPrice>,
  ) {}

  public findAll(): Promise<TokenPrice[]> {
    return this.repository.find({
      order: { order: 'ASC', fullName: 'ASC' },
      where: { deleted: false },
    });
  }

  public findOneByOrFail(
    where: FindOptionsWhere<TokenPrice> | FindOptionsWhere<TokenPrice>[],
  ): Promise<TokenPrice> {
    return this.repository.findOneByOrFail(where);
  }

  public find(options: FindManyOptions<TokenPrice>): Promise<TokenPrice[]> {
    return this.repository.find(options);
  }

  public upsertAll(tokenPrices: TokenPrice[]) {
    tokenPrices.forEach((tokenPrice) => {
      this.upsert(tokenPrice);
    });
  }

  private async upsert(tokenPrice: TokenPrice) {
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