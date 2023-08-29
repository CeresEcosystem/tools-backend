import { IsBoolean, IsNumber } from 'class-validator';

export class UpdateSymbolDto {
  @IsNumber()
  minMovement1: number;

  @IsNumber()
  minMovement2: number;

  @IsNumber()
  priceScale: number;

  @IsBoolean()
  hasIntraday: boolean;

  @IsBoolean()
  hasNoVolume: boolean;
}
