import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PairsLiquidityChanges } from './entity/pairs-liquidity-changes.entity';

@Injectable()
export class PairsLiquidityChangesRepository {
  private readonly logger = new Logger(PairsLiquidityChangesRepository.name);

  constructor(
    @InjectRepository(PairsLiquidityChanges)
    private readonly repository: Repository<PairsLiquidityChanges>,
  ) {}
}
