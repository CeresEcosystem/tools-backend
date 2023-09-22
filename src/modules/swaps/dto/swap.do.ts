export interface SwapDto {
  id: number;
  swappedAt: Date;
  accountId: String;
  inputAssetId: String;
  outputAssetId: String;
  assetInputAmount: number;
  assetOutputAmount: number;
}
