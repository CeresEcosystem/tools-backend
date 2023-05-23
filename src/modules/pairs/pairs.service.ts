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

  public findOne(baseAsset: string, token: string): Promise<Pair> {
    return this.pairsRepository.findOne(baseAsset, token);
  }

  public findAll(): Promise<Pair[]> {
    return this.pairsRepository.findAll();
  }

  public save(dtos: PairBcDto[]): void {
    const entities = this.mapper.toEntities(dtos);

    this.pairsRepository.upsertAll(entities);
  }

  public update(pair: Pair): void {
    this.pairsRepository.update(pair);
  }

  public async calculateTVL(): Promise<number> {
    let pairs: Pair[] = await this.pairsRepository.findAll();
    let tvl = 0;
    pairs.map((pair) => (tvl += pair.liquidity));
    return tvl;
  }
}
