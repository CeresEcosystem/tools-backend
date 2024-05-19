import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PairsVolumeChangeEntity } from './entity/pairs-volume-change.entity';
import { MoreThan, Repository } from 'typeorm';
import { PairsVolumeTotalDto } from './dto/pairs-volume-total.dto';
import { subtractDays } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class PairsVolumeChangeRepository {
  constructor(
    @InjectRepository(PairsVolumeChangeEntity)
    private readonly repository: Repository<PairsVolumeChangeEntity>,
  ) {}

  public findTotalVolumes(numEntries: number): Promise<PairsVolumeTotalDto[]> {
    return this.repository
      .createQueryBuilder()
      .select('SUM(volume)', 'volume')
      .addSelect('token_asset_id', 'tokenAssetId')
      .addSelect('base_asset_id', 'baseAssetId')
      .groupBy('tokenAssetId, baseAssetId')
      .where({ timestamp: MoreThan(subtractDays(new Date(), numEntries)) })
      .getRawMany<PairsVolumeTotalDto>();
  }

  public insertAll(pairsVolumeChanges: PairsVolumeChangeEntity[]): void {
    pairsVolumeChanges.forEach(async (pairVolumeChange) => {
      await this.insert(pairVolumeChange);
    });
  }

  private async insert(
    pairsVolumeChanges: PairsVolumeChangeEntity,
  ): Promise<void> {
    pairsVolumeChanges.timestamp = new Date();

    await this.repository.insert(pairsVolumeChanges);
  }
}
