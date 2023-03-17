import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { PairDto } from '../dto/pair.dto';
import { Pair } from '../entity/pairs.entity';

export class PairToDtoMapper extends BaseDtoMapper<Pair, PairDto> {
  toDto(entity: Pair): PairDto {
    const {
      token,
      tokenFullName,
      tokenAssetId,
      baseAsset,
      baseAssetFullName,
      baseAssetId,
      liquidity,
      baseAssetLiq,
      targetAssetLiq,
      lockedLiquidity,
      volume,
      updatedAt,
    } = entity;

    return {
      token,
      tokenFullName,
      tokenAssetId,
      baseAsset,
      baseAssetFullName,
      baseAssetId,
      liquidity,
      baseAssetLiq,
      targetAssetLiq,
      lockedLiquidity,
      volume,
      updatedAt,
    };
  }
}
