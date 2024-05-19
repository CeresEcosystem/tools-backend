import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairLiquidityChangeEntity } from './entity/pair-liquidity-change.entity';
import { PageOptionsDto } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class PairsLiquidityRepository {
  constructor(
    @InjectRepository(PairLiquidityChangeEntity)
    private readonly repository: Repository<PairLiquidityChangeEntity>,
  ) {}

  public async insert(data: PairLiquidityChangeEntity): Promise<void> {
    await this.repository.upsert(data, [
      'blockNumber',
      'signerId',
      'firstAssetId',
      'secondAssetId',
      'transactionType',
    ]);
  }

  public findAndCount(
    assetA: string,
    assetB: string,
    pageOptions: PageOptionsDto,
  ): Promise<[PairLiquidityChangeEntity[], number]> {
    return this.repository.findAndCount({
      where: { firstAssetId: assetA, secondAssetId: assetB },
      order: { id: 'DESC' },
      skip: pageOptions.skip,
      take: pageOptions.size,
    });
  }
}
