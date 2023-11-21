/* eslint-disable no-undef */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UpsertBannerToEntityMapper } from './mapper/upsert-token-to-entity.mapper';
import { Banner } from './entity/banner.entity';
import { DeviceType } from './banner-device-type.enum';
import * as crypto from 'crypto';
import { UpsertBannerDto } from './dto/upsert-banner.dto';
import { S3Client } from '../s3-client/s3-client';
import { BANNERS_PATH } from './banner.constants';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { BannerDto } from './dto/banner.dto';
import { BannerToDtoMapper } from './mapper/banner-to-dto.mapper';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
    private readonly bannerMapper: BannerToDtoMapper,
    private readonly upsertBannerMapper: UpsertBannerToEntityMapper,
    private readonly s3Client: S3Client,
  ) {}

  public async findAll(
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<BannerDto>> {
    const [data, totalCount] = await this.bannerRepo.findAndCount({
      skip: pageOptions.skip,
      take: pageOptions.size,
      order: { createdAt: 'DESC' },
    });

    const pageMeta = new PageMetaDto(
      pageOptions.page,
      pageOptions.size,
      totalCount,
    );

    return new PageDto(this.bannerMapper.toDtos(data), pageMeta);
  }

  public getAllByDeviceType(device: DeviceType): Promise<Banner[]> {
    return this.bannerRepo.findBy({ device, isDeleted: false });
  }

  public async create(
    bannerDto: UpsertBannerDto,
    sm: Express.Multer.File,
    md: Express.Multer.File,
    lg: Express.Multer.File,
  ): Promise<Banner> {
    const banner = this.upsertBannerMapper.toEntity(bannerDto);

    await this.uploadFiles(banner, sm, md, lg);

    banner.createdAt = new Date();
    banner.updatedAt = new Date();

    return this.bannerRepo.save(banner);
  }

  public async update(
    id: string,
    bannerDto: UpsertBannerDto,
    sm: Express.Multer.File,
    md: Express.Multer.File,
    lg: Express.Multer.File,
  ): Promise<void> {
    if (!(await this.exist({ id }))) {
      throw new BadRequestException('Banner does not exist.');
    }

    const banner = this.upsertBannerMapper.toEntity(bannerDto);

    await this.uploadFiles(banner, sm, md, lg);

    banner.updatedAt = new Date();

    await this.bannerRepo.update(id, banner);
  }

  public async changeStatus(id: string, isActive: boolean): Promise<void> {
    if (!(await this.exist({ id }))) {
      throw new BadRequestException('Banner does not exist.');
    }

    const banner = await this.bannerRepo.findOneBy({ id });
    banner.isDeleted = !isActive;

    await this.bannerRepo.update(id, banner);
  }

  public async delete(id: string): Promise<void> {
    await this.bannerRepo.delete({ id });
  }

  private exist(whereOptions: FindOptionsWhere<Banner>): Promise<boolean> {
    return this.bannerRepo.exist({ where: whereOptions });
  }

  private async uploadFiles(
    banner: Banner,
    sm: Express.Multer.File,
    md: Express.Multer.File,
    lg: Express.Multer.File,
  ): Promise<void> {
    if (sm) {
      banner.sm = await this.uploadFile(sm);
    }

    if (md) {
      banner.md = await this.uploadFile(md);
    }

    if (lg) {
      banner.lg = await this.uploadFile(lg);
    }
  }

  private uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = this.generateFileName(file.originalname);

    return this.s3Client.upload(BANNERS_PATH, file, fileName);
  }

  private generateFileName(originalFileName: string): string {
    const random = crypto.randomBytes(16).toString('hex');
    const extension = originalFileName.split('.').slice(-1);
    const fileName = `${random}.${extension}`;

    return fileName;
  }
}
