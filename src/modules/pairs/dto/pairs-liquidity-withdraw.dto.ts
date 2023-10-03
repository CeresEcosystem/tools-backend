export interface PairsLiquidityWithdrawDto {
  dexId: number;
  outputAssetA: string;
  outputAssetB: string;
  markerAssetDesired: string;
  outputAMin: string;
  outputBMin: string;
}

export const instanceOfPairsLiquidityWithdraw = (
  object: any,
): object is PairsLiquidityWithdrawDto => {
  return (
    'dexId' in object &&
    'outputAssetA' in object &&
    'outputAssetB' in object &&
    'markerAssetDesired' in object &&
    'outputAMin' in object &&
    'outputBMin' in object
  );
};
