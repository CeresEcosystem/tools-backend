import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { LiquidityPairDTO } from './liquidity-pairs.dto';
import { LiquidityPair } from './liquidity-pairs.entity';

export class LiquidityPairsMapper extends BaseEntityMapper<
  LiquidityPair,
  LiquidityPairDTO
> {
  toEntity(dto: LiquidityPairDTO): LiquidityPair {
    return {
      token: dto.token,
      tokenFullName: dto.token_full_name,
      tokenAssetId: dto.token_asset_id,
      baseAsset: dto.base_asset,
      baseAssetFullName: dto.base_asset_full_name,
      baseAssetId: dto.base_asset_id,
      liquidity: dto.liquidity,
      baseAssetLiquidity: Number(dto.base_asset_liq),
      targetAssetLiquidity: Number(dto.target_asset_liq),
      volume: Number(dto.volume),
    } as LiquidityPair;
  }
}
