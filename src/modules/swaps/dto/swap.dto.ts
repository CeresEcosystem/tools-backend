export interface SwapDto {
  swappedAt: Date;
  accountId: string;
  inputAssetId: string;
  outputAssetId: string;
  assetInputAmount: number;
  assetOutputAmount: number;
}
