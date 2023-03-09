import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiquidityPair } from './liquidity-pairs.entity';

@Injectable()
export class LiquidityPairsRepository {
  private readonly logger = new Logger(LiquidityPairsRepository.name);

  constructor(
    @InjectRepository(LiquidityPair)
    private readonly repository: Repository<LiquidityPair>,
  ) {}

  public async upsertAll(liquidityPairs: LiquidityPair[]) {
    liquidityPairs.forEach((liquidityPair) => {
      this.upsert(liquidityPair);
    });
  }

  private async upsert(liquidityPair: LiquidityPair) {
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
