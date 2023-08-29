export interface SymbolChartDto {
  name: string;
  exchange: string;
  listed_exchange: string;
  timezone: string;
  minmovement: number;
  minmovement2: number;
  pricescale: number;
  has_intraday: boolean;
  has_no_volume: boolean;
  description: string;
  type: string;
  ticker: string;
  intraday_multipliers: string[];
  supported_resolutions: string[];
  session: string;
  has_daily: boolean;
}
