import { IsArray, IsNotEmpty } from 'class-validator';

export class SwapTokensDto {
  @IsArray()
  @IsNotEmpty()
  tokens: string[];
}
