import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairsLiquidityChangeEntity } from './entity/pairs-liquidity-change.entity';

@Injectable()
export class PairsLiquidityChangesRepository {
  constructor(
    @InjectRepository(PairsLiquidityChangeEntity)
    private readonly repository: Repository<PairsLiquidityChangeEntity>,
  ) {}

  public insert(data: PairsLiquidityChangeEntity) {
    this.repository.insert(data);
  }
}
