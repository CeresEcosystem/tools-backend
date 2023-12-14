import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PairPeriodicLiquidityChangeEntity } from './entity/pair-periodic-liquidity-change.entity';

@Injectable()
export class PairsPeriodicLiquidityChangeRepository {
  constructor(
    @InjectRepository(PairPeriodicLiquidityChangeEntity)
    private periodicLiqChangeRepo: Repository<PairPeriodicLiquidityChangeEntity>,
  ) {}

  public async savePeriodcLiqChange(
    pairLiqChange: PairPeriodicLiquidityChangeEntity,
  ): Promise<PairPeriodicLiquidityChangeEntity> {
    return await this.periodicLiqChangeRepo.save(pairLiqChange);
  }

  public async findPairPeriodicLiqChange(
    baseAssetSy: string,
    tokenAssetSy: string,
  ): Promise<PairPeriodicLiquidityChangeEntity[]> {
    return await this.periodicLiqChangeRepo.find({
      where: {
        baseAssetSymbol: baseAssetSy,
        tokenAssetSymbol: tokenAssetSy,
      },
    });
  }
}
