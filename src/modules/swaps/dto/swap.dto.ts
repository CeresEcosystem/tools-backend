export interface SwapDto {
  id: number;
  swappedAt: Date;
  accountId: string;
  swapType: string;
  inputAssetId: string;
  outputAssetId: string;
  assetInputAmount: number;
  assetOutputAmount: number;
}
