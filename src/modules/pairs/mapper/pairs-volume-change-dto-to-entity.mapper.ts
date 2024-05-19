import { PairsVolumeChangeEntity } from '../entity/pairs-volume-change.entity';
import { PairsVolumeChangeDto } from '../dto/pairs-volume-change.dto';
import { BaseEntityMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

export class PairsVolumeChangeDtoToEntityMapper extends BaseEntityMapper<
  PairsVolumeChangeEntity,
  PairsVolumeChangeDto
> {
  toEntity(dto: PairsVolumeChangeDto): PairsVolumeChangeEntity {
    return {
      tokenAssetId: dto.tokenAssetId,
      baseAssetId: dto.baseAssetId,
      volume: Number(dto.volume),
      timestamp: dto.timestamp,
    } as PairsVolumeChangeEntity;
  }
}
