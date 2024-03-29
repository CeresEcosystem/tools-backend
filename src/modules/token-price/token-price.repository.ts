import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { TokenPrice } from './entity/token-price.entity';

@Injectable()
export class TokenPriceRepository {
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

  public findOneBy(
    where: FindOptionsWhere<TokenPrice> | FindOptionsWhere<TokenPrice>[],
  ): Promise<TokenPrice> {
    return this.repository.findOneBy(where);
  }

  public findOneByOrFail(
    where: FindOptionsWhere<TokenPrice> | FindOptionsWhere<TokenPrice>[],
  ): Promise<TokenPrice> {
    return this.repository.findOneByOrFail(where);
  }

  public find(options: FindManyOptions<TokenPrice>): Promise<TokenPrice[]> {
    return this.repository.find(options);
  }

  public update(tokenPrice: TokenPrice): void {
    this.repository.update({ id: tokenPrice.id }, tokenPrice);
  }

  public updateBySymbol(tokenSymbol: string, marketCap: string): void {
    this.repository.update({ token: tokenSymbol }, { marketCap });
  }

  public upsertAll(tokenPrices: TokenPrice[]): Promise<void[]> {
    return Promise.all(
      tokenPrices.map(async (tokenPrice) => {
        await this.upsert(tokenPrice);
      }),
    );
  }

  private async upsert(tokenPrice: TokenPrice): Promise<void> {
    tokenPrice.updatedAt = new Date();

    const existingPrice = await this.repository.findOneBy({
      token: tokenPrice.token,
    });

    if (!existingPrice) {
      await this.repository.insert(tokenPrice);

      return;
    }

    await this.repository.update(
      {
        token: tokenPrice.token,
      },
      tokenPrice,
    );
  }
}
