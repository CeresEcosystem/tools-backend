import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PairsVolumeChangeEntity } from './entity/pairs-volume-change.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PairsVolumeChangeRepository {
  constructor(
    @InjectRepository(PairsVolumeChangeEntity)
    private readonly repository: Repository<PairsVolumeChangeEntity>,
  ) {}

  public findOneByBaseAssetIdAndTokenAssetId(
    baseAssetId: string,
    tokenAssetId: string,
    numEntries: number,
  ): Promise<PairsVolumeChangeEntity[]> {
    return this.repository.find({
      where: {
        tokenAssetId,
        baseAssetId,
      },
      take: numEntries,
    });
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
