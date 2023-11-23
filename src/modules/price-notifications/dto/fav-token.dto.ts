import { IsUUID } from 'class-validator';

export class FavTokenDto {
  @IsUUID()
  deviceId: string;
  token: string;
}
