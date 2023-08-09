import { Module } from '@nestjs/common';
import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entity/banner.entity';
import { BannerToDtoMapper } from './mapper/banner-to-dto.mapper';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { BannerToBaseDtoMapper } from './mapper/banner-to-base-dto.mapper';
import { UpsertBannerToEntityMapper } from './mapper/upsert-token-to-entity.mapper';
import { S3ClientModule } from '../s3-client/s3-client-module';

@Module({
  imports: [
    AuthModule,
    S3ClientModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Banner]),
  ],
  controllers: [BannerController],
  providers: [
    BannerService,
    BannerToDtoMapper,
    BannerToBaseDtoMapper,
    UpsertBannerToEntityMapper,
  ],
  exports: [],
})
export class BannerModule {}
