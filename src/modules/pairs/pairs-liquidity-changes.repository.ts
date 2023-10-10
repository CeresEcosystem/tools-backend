import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairLiquidityChangeEntity } from './entity/pair-liquidity-change.entity';
import { PairsLiquidityEntityToDtoMapper } from './mapper/pair-liquidity-entity-to-dto.mapper';

@Injectable()
export class PairsLiquidityChangesRepository {
  private readonly logger = new Logger(PairsLiquidityChangesRepository.name);

  constructor(
    @InjectRepository(PairLiquidityChangeEntity)
    private readonly repository: Repository<PairLiquidityChangeEntity>,
    private readonly mapper: PairsLiquidityEntityToDtoMapper,
  ) {}

  public async insert(data: PairLiquidityChangeEntity) {
    await this.repository.upsert(data, [
      'blockNumber',
      'signerId',
      'firstAssetId',
      'secondAssetId',
      'type',
    ]);
  }

  public async find(assetA: string, assetB: string) {
    const result = await this.repository.find({
      where: { firstAssetId: assetA, secondAssetId: assetB },
      order: { id: 'DESC' },
    });

    return result.map((pair) => this.mapper.toDto(pair));
  }
}
