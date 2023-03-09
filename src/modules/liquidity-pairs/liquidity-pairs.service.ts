import { Injectable, Logger } from '@nestjs/common';
import { LiquidityPairDTO } from './liquidity-pairs.dto';
import { LiquidityPair } from './liquidity-pairs.entity';
import { LiquidityPairsMapper } from './liquidity-pairs.mapper';
import { LiquidityPairsRepository } from './liquidity-pairs.repository';

@Injectable()
export class LiquidityPairsService {
  private readonly logger = new Logger(LiquidityPairsService.name);

  constructor(
    private readonly liquidityPairsRepository: LiquidityPairsRepository,
    private readonly mapper: LiquidityPairsMapper,
  ) {}

  public save(dtos: LiquidityPairDTO[]): void {
    const entities = this.mapper.toEntities(dtos);

    this.resolveOrdering(entities);

    this.liquidityPairsRepository.upsertAll(entities);
  }

  private resolveOrdering(liquidityPairs: LiquidityPair[]) {
    liquidityPairs.sort((a, b) => (a.liquidity < b.liquidity ? 1 : -1));

    liquidityPairs.forEach((liquidityPair, index) => {
      liquidityPair.order = index + 1;
    });
  }
}
