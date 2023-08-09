import { BannerBaseDto } from './banner-base.dto';

export interface BannerDto extends BannerBaseDto {
  id: string;
  device: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
