export interface PairPeriodicLiquidityChangeDto {
  baseAssetSymbol: string;
  tokenAssetSymbol: string;
  liquidity: number;
  baseAssetLiq: number;
  tokenAssetLiq: number;
  updatedAt: Date;
}
