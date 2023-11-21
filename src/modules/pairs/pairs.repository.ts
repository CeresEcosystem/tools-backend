import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Pair } from './entity/pairs.entity';

@Injectable()
export class PairsRepository {

  constructor(
    @InjectRepository(Pair)
    private readonly repository: Repository<Pair>,
  ) {}

  public findOne(baseAsset: string, token: string): Promise<Pair> {
    return this.repository.findOneBy({ baseAsset, token });
  }

  public findAll(): Promise<Pair[]> {
    return this.repository.find({
      order: { liquidity: 'DESC', tokenFullName: 'ASC' },
      where: { deleted: false, liquidity: MoreThan(0) },
    });
  }

  public findOneByBaseAssetIdAndTokenAssetId(
    baseAssetId: string,
    tokenAssetId: string,
  ): Promise<Pair> {
    return this.repository.findOneBy({ baseAssetId, tokenAssetId });
  }

  public update(pair: Pair): void {
    this.repository.update({ id: pair.id }, pair);
  }

  public upsertAll(liquidityPairs: Pair[]): void {
    liquidityPairs.forEach(async (liquidityPair) => {
      await this.upsert(liquidityPair);
    });
  }

  private async upsert(liquidityPair: Pair): Promise<void> {
    liquidityPair.updatedAt = new Date();

    const existingPair = await this.repository.findOneBy({
      baseAsset: liquidityPair.baseAsset,
      token: liquidityPair.token,
    });

    if (!existingPair) {
      this.repository.insert(liquidityPair);

      return;
    }

    this.repository.update(
      {
        baseAsset: liquidityPair.baseAsset,
        token: liquidityPair.token,
      },
      liquidityPair,
    );
  }
}
