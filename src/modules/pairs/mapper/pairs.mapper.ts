import { BaseEntityMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { PairBcDto } from '../dto/pair-bc.dto';
import { Pair } from '../entity/pairs.entity';

export class PairsMapper extends BaseEntityMapper<Pair, PairBcDto> {
  toEntity(dto: PairBcDto): Pair {
    return {
      token: dto.token,
      tokenFullName: dto.tokenFullName,
      tokenAssetId: dto.tokenAssetId,
      baseAsset: dto.baseAsset,
      baseAssetFullName: dto.baseAssetFullName,
      baseAssetId: dto.baseAssetId,
      liquidity: dto.liquidity,
      baseAssetLiq: Number(dto.baseAssetLiq),
      targetAssetLiq: Number(dto.targetAssetLiq),
      volume: Number(dto.volume),
    } as Pair;
  }
}
