export interface PairsLiquidityDepositDto {
  dexId: number;
  inputAssetA: string;
  inputAssetB: string;
  inputADesired: string;
  inputBDesired: string;
  inputAMin: string;
  inputBMin: string;
}

export const instanceOfPairsLiquidityDeposit = (
  object: any,
): object is PairsLiquidityDepositDto => {
  return (
    'dexId' in object &&
    'inputAssetA' in object &&
    'inputAssetB' in object &&
    'inputADesired' in object &&
    'inputBDesired' in object &&
    'inputAMin' in object &&
    'inputBMin' in object
  );
};
