import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class TokenPricesQuery {
  @IsString()
  symbol: string;

  @IsNumberString()
  resolution: number;

  @IsNumberString()
  from: number;

  @IsNumberString()
  to: number;

  @IsNumberString()
  @IsOptional()
  countback: number;
}
