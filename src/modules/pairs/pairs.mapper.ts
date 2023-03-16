import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { LiquidityPairDTO } from './pairs.dto';
import { LiquidityPair } from './pairs.entity';

export class PairsMapper extends BaseEntityMapper<
  LiquidityPair,
  LiquidityPairDTO
> {
  toEntity(dto: LiquidityPairDTO): LiquidityPair {
    return {
      token: dto.token,
      tokenFullName: dto.tokenFullName,
      tokenAssetId: dto.tokenAssetId,
      baseAsset: dto.baseAsset,
      baseAssetFullName: dto.baseAssetFullName,
      baseAssetId: dto.baseAssetId,
      liquidity: dto.liquidity,
      baseAssetLiquidity: Number(dto.baseAssetLiq),
      targetAssetLiquidity: Number(dto.targetAssetLiq),
      volume: Number(dto.volume),
    } as LiquidityPair;
  }
}
