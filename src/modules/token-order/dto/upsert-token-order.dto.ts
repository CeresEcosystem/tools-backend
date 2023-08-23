import { IsNumber, IsString } from 'class-validator';

export class UpsertTokenOrderDto {
  @IsString()
  symbol: string;

  @IsNumber()
  order: number;
}
