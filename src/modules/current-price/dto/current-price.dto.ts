export interface CurrentPriceDto {
  token: string;
  price: string;
  assetId: string;
  fullName: string;
  lockedTokens: number;
  updatedAt: Date;
}
