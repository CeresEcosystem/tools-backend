export interface KensetsuCollateralPositionDto {
  collateralAssetId: { code: string };
  collateralAmount: string;
  stablecoinAssetId: { code: string };
  debt: string;
  interestCoefficient: string;
}
