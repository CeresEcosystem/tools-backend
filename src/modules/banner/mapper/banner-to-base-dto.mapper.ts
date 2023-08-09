import { BaseDtoMapper } from '../../../utils/mappers/base-dto-mapper';
import { BannerBaseDto } from '../dto/banner-base.dto';
import { Banner } from '../entity/banner.entity';

export class BannerToBaseDtoMapper extends BaseDtoMapper<
  Banner,
  BannerBaseDto
> {
  toDto(entity: Banner): BannerBaseDto {
    const { sm, md, lg, link, title } = entity;

    return {
      sm,
      md,
      lg,
      link,
      title,
    };
  }
}
