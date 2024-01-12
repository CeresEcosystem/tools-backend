import { IsString } from 'class-validator';

export class CurrencyDto {
  @IsString()
  currency: string;
}
