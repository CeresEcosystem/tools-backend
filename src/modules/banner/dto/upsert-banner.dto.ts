import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { DeviceType } from '../banner-device-type.enum';

export class UpsertBannerDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  sm: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary' })
  md: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary' })
  lg: Express.Multer.File;

  @IsString()
  link: string;

  @IsString()
  title: string;

  @IsEnum(DeviceType)
  device: DeviceType;
}
