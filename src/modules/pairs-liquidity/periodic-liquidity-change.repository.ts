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

  public savePeriodicLiqChange(
    pairLiqChange: PairPeriodicLiquidityChangeEntity,
  ): Promise<PairPeriodicLiquidityChangeEntity> {
    return this.periodicLiqChangeRepo.save(pairLiqChange);
  }

  public findPairPeriodicLiqChange(
    baseAssetSymbol: string,
    tokenAssetSymbol: string,
  ): Promise<PairPeriodicLiquidityChangeEntity[]> {
    return this.periodicLiqChangeRepo.find({
      where: {
        baseAssetSymbol,
        tokenAssetSymbol,
      },
    });
  }
}
