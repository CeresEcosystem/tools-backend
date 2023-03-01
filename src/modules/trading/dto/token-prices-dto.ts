import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class TokenPricesDto {
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
