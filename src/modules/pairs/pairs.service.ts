/* eslint-disable no-await-in-loop */
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

    const pairsWithVolume: PairDto[] = [];
    const weekVolumes = await this.pairsVolumeRepository.findTotalVolumes(7);
    const monthVolumes = await this.pairsVolumeRepository.findTotalVolumes(30);
    const threeMonthsVolumes =
      await this.pairsVolumeRepository.findTotalVolumes(90);

    for (const pair of pairs) {
      pairsWithVolume.push({
        ...pair,
        volumePeriods: {
          '24h': pair.volume,
          '7d': weekVolumes.find(
            (vol) =>
              vol.baseAssetId === pair.baseAssetId &&
              vol.tokenAssetId === pair.tokenAssetId,
          )?.volume,
          '1M': monthVolumes.find(
            (vol) =>
              vol.baseAssetId === pair.baseAssetId &&
              vol.tokenAssetId === pair.tokenAssetId,
          )?.volume,
          '3M': threeMonthsVolumes.find(
            (vol) =>
              vol.baseAssetId === pair.baseAssetId &&
              vol.tokenAssetId === pair.tokenAssetId,
          )?.volume,
        },
      });
    }

    return pairsWithVolume;
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
