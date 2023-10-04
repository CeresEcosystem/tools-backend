import { Injectable } from '@nestjs/common';
import { PairsLiquidityChangeEntity } from './entity/pairs-liquidity-change.entity';
import { PairsLiquidityChangesRepository } from './pairs-liquidity-changes.repository';

@Injectable()
export class PairsLiquidityChangesService {
  constructor(private readonly repository: PairsLiquidityChangesRepository) {}

  public insert(data: PairsLiquidityChangeEntity) {
    this.repository.insert(data);
  }

  public find(assetA: string, assetB: string) {
    return this.repository.find(assetA, assetB);
  }
}
