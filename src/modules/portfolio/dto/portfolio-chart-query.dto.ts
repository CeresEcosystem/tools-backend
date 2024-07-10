import { IsNumberString, IsString } from 'class-validator';

export class PortfolioChartQuery {
  @IsString()
  resolution: string;

  @IsNumberString()
  from: number;

  @IsNumberString()
  to: number;
}
