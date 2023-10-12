import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairLiquidityChangeEntity } from './entity/pair-liquidity-change.entity';
import { PairLiquidityEntityToDtoMapper } from './mapper/pair-liquidity-entity-to-dto.mapper';
import { skip } from 'rxjs';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';

@Injectable()
export class PairsLiquidityChangesRepository {
  private readonly logger = new Logger(PairsLiquidityChangesRepository.name);

  constructor(
    @InjectRepository(PairLiquidityChangeEntity)
    private readonly repository: Repository<PairLiquidityChangeEntity>,
    private readonly mapper: PairLiquidityEntityToDtoMapper,
  ) {}

  public async insert(data: PairLiquidityChangeEntity): Promise<void> {
    await this.repository.upsert(data, [
      'blockNumber',
      'signerId',
      'firstAssetId',
      'secondAssetId',
      'transaction_type',
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
