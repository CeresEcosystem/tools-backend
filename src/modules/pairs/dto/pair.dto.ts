interface PairVolume {
  '24h': number;
  '7d': number;
  '1M': number;
  '3M': number;
}

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
  volumes: PairVolume;

  updatedAt: Date;
}
