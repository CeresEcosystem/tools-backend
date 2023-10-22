import Big from 'big.js';

export interface PriceChangeDto {
  token: string;
  intervalHours: number;
  currentPrice: Big;
  oldPrice: Big;
  valueDiff: Big;
  percentageDiff: Big;
}
