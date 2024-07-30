import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { catchError, firstValueFrom, retry } from 'rxjs';
import { createFile } from 'src/utils/storage.helper';
import {
  ICONS_URL,
  ICONS_STORAGE_PATH,
  IMAGE_EXTENSIONS,
  SVG_IMAGE_TYPE,
  PNG_IMAGE_TYPE,
  SVG_IMAGE_TYPE_UTF8,
} from './icons.const';
import { TokenIconDto } from './icons.dto';
import { AxiosError } from 'axios';
import { CRON_DISABLED, IS_WORKER_INSTANCE } from 'src/constants/constants';

@Injectable()
export class IconsService {
  private readonly logger = new Logger(IconsService.name);

  constructor(private readonly httpService: HttpService) {
    if (IS_WORKER_INSTANCE) {
      this.fetchIcons();
    }
  }

  @Cron(CronExpression.EVERY_3_HOURS, { disabled: CRON_DISABLED })
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

    await Promise.all(data.map(this.saveTokenIcon.bind(this)));

    this.logger.log('Downloading of icons was successful!');
  }

  private saveTokenIcon(tokenIcon: TokenIconDto): void {
    const { symbol, icon } = tokenIcon;
    const { iconType, iconContent } = this.parseIcon(icon);
    const extension = IMAGE_EXTENSIONS.get(iconType);

    if (!extension) {
      throw new NotImplementedException(
        `Image extension not available for icon type: ${iconType}`,
      );
    }

    this.createFile(symbol + extension, iconType, iconContent);
  }

  private parseIcon(icon: string): { iconType: string; iconContent: string } {
    const [iconType] = icon.split(',', 1);
    const iconContent = icon.replace(`${iconType},`, '');

    return {
      iconType,
      iconContent,
    };
  }

  private createFile(
    fileName: string,
    iconType: string,
    iconContent: string,
  ): Promise<void> {
    if (iconType === SVG_IMAGE_TYPE || iconType === SVG_IMAGE_TYPE_UTF8) {
      return createFile(
        ICONS_STORAGE_PATH,
        fileName,
        decodeURIComponent(iconContent),
      );
    }

    if (iconType === PNG_IMAGE_TYPE) {
      return createFile(
        ICONS_STORAGE_PATH,
        fileName,
        Buffer.from(iconContent, 'base64'),
      );
    }

    throw new NotImplementedException(
      `Image decoding not implemented for icon type: ${iconType}`,
    );
  }

  private logWarning(error: AxiosError): void {
    this.logger.warn(
      `An error happened while contacting icons API!
      msg: ${error.message}, code: ${error.code}, cause: ${error.cause}`,
    );
  }
}
