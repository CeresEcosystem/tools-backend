export interface PairDto {
  token: string;
  tokenFullName: string;
  tokenAssetId: string;

  baseAsset: string;
  baseAssetFullName: string;
  baseAssetId: string;

  liquidity: number;
  baseAssetLiq: number;
  targetAssetLiq: number;
  lockedLiquidity: number;
  volume: number;

  updatedAt: Date;
}
