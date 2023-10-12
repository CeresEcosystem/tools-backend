import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairLiquidityChangeEntity } from './entity/pair-liquidity-change.entity';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';

@Injectable()
export class PairsLiquidityRepository {
  private readonly logger = new Logger(PairsLiquidityRepository.name);

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
