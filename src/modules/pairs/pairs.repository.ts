import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Pair } from './entity/pairs.entity';

@Injectable()
export class PairsRepository {
  private readonly logger = new Logger(PairsRepository.name);

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

  public update(pair: Pair) {
    this.repository.update({ id: pair.id }, pair);
  }

  public upsertAll(liquidityPairs: Pair[]) {
    liquidityPairs.forEach(async (liquidityPair) => {
      await this.upsert(liquidityPair);
    });
  }

  private async upsert(liquidityPair: Pair) {
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
