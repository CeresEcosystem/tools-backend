import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class TokenPricesQuery {
  @IsString()
  symbol: string;

  @IsString()
  resolution: string;

  @IsNumberString()
  to: number;

  @IsNumberString()
  @IsOptional()
  countback: number;
}
