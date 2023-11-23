import { IsUUID } from 'class-validator';

export class InitFavTokensDto {
  @IsUUID()
  deviceId: string;
  tokens: string[];
}
