export interface PairLiquidityWithdrawDto {
  dexId: number;
  outputAssetA: string;
  outputAssetB: string;
  markerAssetDesired: string;
  outputAMin: string;
  outputBMin: string;
}
