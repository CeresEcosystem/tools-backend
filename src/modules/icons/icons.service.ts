import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { catchError, firstValueFrom, retry } from 'rxjs';
import { createFile } from 'src/utils/storage.helper';
import {
  ALLOWED_ICON_TYPE,
  ICONS_URL,
  ICONS_STORAGE_PATH,
  SVG_EXTENSION,
} from './icons.const';
import { TokenIconDto } from './icons.dto';
import { AxiosError } from 'axios';

@Injectable()
export class IconsService {
  private readonly logger = new Logger(IconsService.name);

  constructor(private readonly httpService: HttpService) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  async fetchIcons(): Promise<void> {
    this.logger.log('Start downloading token icons.');

    const { data } = await firstValueFrom(
      this.httpService.get<TokenIconDto[]>(ICONS_URL).pipe(
        retry({ count: 10, delay: 1000 }),
        catchError((error: AxiosError) => {
          this.logWarning(error);
          throw new BadGatewayException('Icons API unreachable.');
        }),
      ),
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

  private parseIcon(icon: string): { iconType: string; iconContent: string } {
    const [iconType] = icon.split(',', 1);
    const iconContent = icon.replace(`${iconType},`, '');

    return {
      iconType,
      iconContent,
    };
  }

  private decodeIconContent(iconContent: string): string {
    return decodeURIComponent(iconContent);
  }

  private logWarning(error: AxiosError): void {
    this.logger.warn(
      `An error happened while contacting icons API!
      msg: ${error.message}, code: ${error.code}, cause: ${error.cause}`,
    );
  }
}
