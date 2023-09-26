export interface SwapDto {
  id: number;
  swappedAt: Date;
  accountId: string;
  inputAssetId: string;
  outputAssetId: string;
  assetInputAmount: number;
  assetOutputAmount: number;
}
