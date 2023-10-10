export interface PairsLiquidityWithdrawDto {
  dexId: number;
  outputAssetA: string;
  outputAssetB: string;
  markerAssetDesired: string;
  outputAMin: string;
  outputBMin: string;
}
