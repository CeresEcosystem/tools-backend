import { Injectable } from '@nestjs/common';
import { PairBcDto } from './dto/pair-bc.dto';
import { Pair } from './entity/pairs.entity';
import { PairsMapper } from './mapper/pairs.mapper';
import { PairsRepository } from './pairs.repository';
import { PairsVolumeChangeDto } from './dto/pairs-volume-change.dto';
import { PairsVolumeChangeDtoToEntityMapper } from './mapper/pairs-volume-change-dto-to-entity.mapper';
import { PairsVolumeChangeRepository } from './pairs-volume.repository';
import { PairDto } from './dto/pair.dto';

@Injectable()
export class PairsService {
  constructor(
    private readonly pairsRepository: PairsRepository,
    private readonly pairsVolumeRepository: PairsVolumeChangeRepository,
    private readonly mapper: PairsMapper,
    private readonly pairVolumeMapper: PairsVolumeChangeDtoToEntityMapper,
  ) {}

  public findOne(baseAsset: string, token: string): Promise<Pair> {
    return this.pairsRepository.findOne(baseAsset, token);
  }

  public async findAll(): Promise<PairDto[]> {
    const pairs = await this.pairsRepository.findAll();

    const pairsWithVolume: PairDto[] = await Promise.all(
      pairs.map(async (pair) => {
        const weekVolume = await this.getVolumeForTimeInterval(pair, 7);
        const monthVolume = await this.getVolumeForTimeInterval(pair, 30);
        const threeMonthsVolume = await this.getVolumeForTimeInterval(pair, 90);

        return {
          ...pair,
          volumes: {
            '24h': pair.volume,
            '7d': weekVolume,
            '1M': monthVolume,
            '3M': threeMonthsVolume,
          },
        };
      }),
    );

    return pairsWithVolume;
  }

  private async getVolumeForTimeInterval(
    pair: Pair,
    numEntries: number,
  ): Promise<number> {
    const volumeEntities =
      await this.pairsVolumeRepository.findOneByBaseAssetIdAndTokenAssetId(
        pair.baseAssetId,
        pair.tokenAssetId,
        numEntries,
      );
    const totalVolume = volumeEntities.reduce(
      (acc, curr) => acc + curr.volume,
      0,
    );

    return totalVolume;
  }

  public findOneByAssetIds(
    baseAssetId: string,
    tokenAssetId: string,
  ): Promise<Pair> {
    return this.pairsRepository.findOneByBaseAssetIdAndTokenAssetId(
      baseAssetId,
      tokenAssetId,
    );
  }

  public save(dtos: PairBcDto[]): void {
    const entities = this.mapper.toEntities(dtos);

    this.pairsRepository.upsertAll(entities);
  }

  public savePairsVolumeChanges(dtos: PairsVolumeChangeDto[]): void {
    const entities = this.pairVolumeMapper.toEntities(dtos);

    this.pairsVolumeRepository.insertAll(entities);
  }

  public update(pair: Pair): void {
    this.pairsRepository.update(pair);
  }

  public async calculateTVL(): Promise<number> {
    const pairs = await this.pairsRepository.findAll();

    return pairs.reduce((partialSum, pair) => partialSum + pair.liquidity, 0);
  }
}
