/* eslint-disable no-undef */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { BannerService } from './banner.service';
import { BannerToDtoMapper } from './mapper/banner-to-dto.mapper';
import { Roles } from 'src/guards/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role } from '../auth/user-role.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { BannerDto } from './dto/banner.dto';
import { BannerBaseDto } from './dto/banner-base.dto';
import { DeviceType } from './banner-device-type.enum';
import { BannerToBaseDtoMapper } from './mapper/banner-to-base-dto.mapper';
import { UpsertBannerDto } from './dto/upsert-banner.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';

@Controller('banners')
@ApiTags('Banners')
@ApiBearerAuth()
export class BannerController {
  constructor(
    private readonly bannerService: BannerService,
    private readonly bannerMapper: BannerToDtoMapper,
    private readonly bannerBaseMapper: BannerToBaseDtoMapper,
  ) {}

  @Get('/:device')
  public findAllByDeviceType(
    @Param('device', new ParseEnumPipe(DeviceType)) device: DeviceType,
  ): Promise<BannerBaseDto[]> {
    return this.bannerBaseMapper.toDtosAsync(
      this.bannerService.getAllByDeviceType(device),
    );
  }

  @Get()
  @ApiTags('Admin')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  public findAll(
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageDto<BannerDto>> {
    return this.bannerService.findAll(pageOptions);
  }

  @Post()
  @ApiTags('Admin')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'sm', maxCount: 1 },
      { name: 'md', maxCount: 1 },
      { name: 'lg', maxCount: 1 },
    ]),
  )
  public create(
    @Body() bannerDto: UpsertBannerDto,
    @UploadedFiles()
    files: {
      sm: Express.Multer.File[];
      md: Express.Multer.File[];
      lg: Express.Multer.File[];
    },
  ): Promise<BannerDto> {
    const { sm, md, lg } = this.destructFiles(files);

    return this.bannerMapper.toDtoAsync(
      this.bannerService.create(bannerDto, sm, md, lg),
    );
  }

  @Put(':id')
  @ApiTags('Admin')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'sm', maxCount: 1 },
      { name: 'md', maxCount: 1 },
      { name: 'lg', maxCount: 1 },
    ]),
  )
  public update(
    @Param('id') id: string,
    @Body() bannerDto: UpsertBannerDto,
    @UploadedFiles()
    files: {
      sm: Express.Multer.File[];
      md: Express.Multer.File[];
      lg: Express.Multer.File[];
    },
  ): Promise<void> {
    const { sm, md, lg } = this.destructFiles(files);

    return this.bannerService.update(id, bannerDto, sm, md, lg);
  }

  @Put(':id/activate')
  @ApiTags('Admin')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  public activate(@Param('id') id: string): Promise<void> {
    return this.bannerService.changeStatus(id, true);
  }

  @Put(':id/deactivate')
  @ApiTags('Admin')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  public deactivate(@Param('id') id: string): Promise<void> {
    return this.bannerService.changeStatus(id, false);
  }

  @Delete(':id')
  @ApiTags('Admin')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  public delete(@Param('id') id: string): Promise<void> {
    return this.bannerService.delete(id);
  }

  private destructFiles(files: {
    sm: Express.Multer.File[];
    md: Express.Multer.File[];
    lg: Express.Multer.File[];
  }): {
    sm: Express.Multer.File;
    md: Express.Multer.File;
    lg: Express.Multer.File;
  } {
    const sm = this.destructOrNull(files.sm);
    const md = this.destructOrNull(files.md);
    const lg = this.destructOrNull(files.lg);

    return { sm, md, lg };
  }

  private destructOrNull(
    fileArray: Express.Multer.File[],
  ): Express.Multer.File {
    return fileArray ? fileArray[0] : null;
  }
}
