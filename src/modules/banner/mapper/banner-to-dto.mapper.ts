import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { BannerDto } from '../dto/banner.dto';
import { Banner } from '../entity/banner.entity';

export class BannerToDtoMapper extends BaseDtoMapper<Banner, BannerDto> {
  toDto(entity: Banner): BannerDto {
    const {
      id,
      sm,
      md,
      lg,
      link,
      title,
      device,
      isDeleted,
      createdAt,
      updatedAt,
    } = entity;

    return {
      id,
      sm,
      md,
      lg,
      link,
      title,
      device,
      isActive: isDeleted,
      createdAt,
      updatedAt,
    };
  }
}
