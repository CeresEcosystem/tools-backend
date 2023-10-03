import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairsLiquidityChanges } from './entity/pairs-liquidity-changes.entity';

@Injectable()
export class PairsLiquidityChangesRepository {
  constructor(
    @InjectRepository(PairsLiquidityChanges)
    private readonly repository: Repository<PairsLiquidityChanges>,
  ) {}
}
