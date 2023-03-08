import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { createFile } from 'src/common/storage.helper';
import {
  ALLOWED_ICON_TYPE,
  ICONS_URL,
  ICONS_STORAGE_PATH,
  SVG_EXTENSION,
} from './icons.const';
import { TokenIconDto } from './icons.dto';

@Injectable()
export class IconsService {
  private readonly logger = new Logger(IconsService.name);

  constructor(private readonly httpService: HttpService) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  async fetchIcons() {
    this.logger.log('Start downloading token icons.');

    const { data } = await firstValueFrom(
      this.httpService.get<TokenIconDto[]>(ICONS_URL),
    );

    data.forEach((tokenIcon) => {
      this.saveTokenIcon(tokenIcon);
    });

    this.logger.log('Downloading of icons was successful!');
  }

  private saveTokenIcon(tokenIcon: TokenIconDto): void {
    const { symbol, icon } = tokenIcon;
    const { iconType, iconContent } = this.parseIcon(icon);

    if (!iconType.startsWith(ALLOWED_ICON_TYPE)) {
      return;
    }

    const iconFile = this.decodeIconContent(iconContent);

    createFile(ICONS_STORAGE_PATH, symbol + SVG_EXTENSION, iconFile);
  }

  private parseIcon(icon: string) {
    const iconType = icon.split(',', 1)[0];
    const iconContent = icon.replace(iconType + ',', '');

    return {
      iconType,
      iconContent,
    };
  }

  private decodeIconContent(iconContent: string) {
    return decodeURIComponent(iconContent);
  }
}
