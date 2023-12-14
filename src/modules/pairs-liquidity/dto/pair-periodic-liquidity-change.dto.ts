export interface PairPeriodicLiquidityChangeDto {
  baseAssetSymbol: string;
  baseAssetName: string;
  baseAssetId: string;
  tokenAssetName: string;
  tokenAssetSymbol: string;
  tokenAssetId: string;
  liquidity: number;
  updatedAt: Date;
}
