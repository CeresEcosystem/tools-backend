import { Injectable } from '@nestjs/common';
import { PairLiquidityChangeEntity } from './entity/pair-liquidity-change.entity';
import { PairsLiquidityChangesRepository } from './pairs-liquidity-changes.repository';

@Injectable()
export class PairsLiquidityChangesService {
  constructor(private readonly repository: PairsLiquidityChangesRepository) {}

  public insert(data: PairLiquidityChangeEntity) {
    this.repository.insert(data);
  }

  public find(assetA: string, assetB: string) {
    return this.repository.find(assetA, assetB);
  }
}
