import Big from 'big.js';

export interface PriceChangeDto {
  intervalHours: number;
  currentPrice: Big;
  oldPrice: Big;
  valueDiff: Big;
  percentageDiff: Big;
}
