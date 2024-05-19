import { BaseEntityMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { UpsertBannerDto } from '../dto/upsert-banner.dto';
import { Banner } from '../entity/banner.entity';

export class UpsertBannerToEntityMapper extends BaseEntityMapper<
  Banner,
  UpsertBannerDto
> {
  toEntity(dto: UpsertBannerDto): Banner {
    const { link, title, device } = dto;

    return {
      link,
      title,
      device,
    } as Banner;
  }
}
