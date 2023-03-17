import { Injectable, Logger } from '@nestjs/common';
import { PairBcDto } from './dto/pair-bc.dto';
import { Pair } from './entity/pairs.entity';
import { PairsMapper } from './mapper/pairs.mapper';
import { PairsRepository } from './pairs.repository';

@Injectable()
export class PairsService {
  private readonly logger = new Logger(PairsService.name);

  constructor(
    private readonly pairsRepository: PairsRepository,
    private readonly mapper: PairsMapper,
  ) {}

  public findAll(): Promise<Pair[]> {
    return this.pairsRepository.findAll();
  }

  public save(dtos: PairBcDto[]): void {
    const entities = this.mapper.toEntities(dtos);

    this.resolveOrdering(entities);

    this.pairsRepository.upsertAll(entities);
  }

  private resolveOrdering(liquidityPairs: Pair[]) {
    liquidityPairs.sort((a, b) => (a.liquidity < b.liquidity ? 1 : -1));

    liquidityPairs.forEach((liquidityPair, index) => {
      liquidityPair.order = index + 1;
    });
  }
}
