import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class TradingChartQuery {
  @IsString()
  symbol: string;

  @IsString()
  resolution: string;

  @IsNumberString()
  from: number;

  @IsNumberString()
  to: number;

  @IsNumberString()
  @IsOptional()
  countback: number;
}
