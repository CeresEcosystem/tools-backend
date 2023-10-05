import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairsLiquidityChangeEntity } from './entity/pairs-liquidity-change.entity';

@Injectable()
export class PairsLiquidityChangesRepository {
  private readonly logger = new Logger(PairsLiquidityChangesRepository.name);

  constructor(
    @InjectRepository(PairsLiquidityChangeEntity)
    private readonly repository: Repository<PairsLiquidityChangeEntity>,
  ) {}

  public async insert(data: PairsLiquidityChangeEntity) {
    await this.repository.upsert(data, [
      'blockNumber',
      'signerId',
      'firstAssetId',
      'secondAssetId',
      'type',
    ]);
  }

  public find(assetA: string, assetB: string) {
    return this.repository.find({
      where: { firstAssetId: assetA, secondAssetId: assetB },
      order: { id: 'DESC' },
    });
  }
}
