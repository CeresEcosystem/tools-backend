export interface SymbolAdminDto {
  id: string;
  description: string;
  minMovement1: number;
  minMovement2: number;
  priceScale: number;
  hasIntraday: boolean;
  hasNoVolume: boolean;
}
