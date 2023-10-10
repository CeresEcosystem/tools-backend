export interface PairLiquidityChangeDto {
  signerId: string;
  firstAssetId: string;
  secondAssetId: string;
  firstAssetAmount: string;
  secondAssetAmount: string;
  type: string;
  timestamp: number;
}
