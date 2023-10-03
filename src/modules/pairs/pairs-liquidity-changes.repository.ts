import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairsLiquidityChangesEntity } from './entity/pairs-liquidity-changes.entity';

@Injectable()
export class PairsLiquidityChangesRepository {
  constructor(
    @InjectRepository(PairsLiquidityChangesEntity)
    private readonly repository: Repository<PairsLiquidityChangesEntity>,
  ) {}
}
