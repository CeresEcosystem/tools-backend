import { Injectable, Logger } from '@nestjs/common';
import { LiquidityPairDTO } from './pairs.dto';
import { LiquidityPair } from './pairs.entity';
import { PairsMapper } from './pairs.mapper';
import { PairsRepository } from './pairs.repository';

@Injectable()
export class PairsService {
  private readonly logger = new Logger(PairsService.name);

  constructor(
    private readonly pairsRepository: PairsRepository,
    private readonly mapper: PairsMapper,
  ) {}

  public save(dtos: LiquidityPairDTO[]): void {
    const entities = this.mapper.toEntities(dtos);

    this.resolveOrdering(entities);

    this.pairsRepository.upsertAll(entities);
  }

  private resolveOrdering(liquidityPairs: LiquidityPair[]) {
    liquidityPairs.sort((a, b) => (a.liquidity < b.liquidity ? 1 : -1));

    liquidityPairs.forEach((liquidityPair, index) => {
      liquidityPair.order = index + 1;
    });
  }
}
