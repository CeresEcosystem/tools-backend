/* eslint-disable camelcase */
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, of, retry } from 'rxjs';
import { UserDevice } from '../price-notifications/entity/user-device.entity';
import { TokenPrice } from '../token-price/entity/token-price.entity';
import Big from 'big.js';

const ONE_SIGNAL_API = 'ONE_SIGNAL_API';
const ONE_SIGNAL_APP_ID = 'ONE_SIGNAL_APP_ID';
const ONE_SIGNAL_API_KEY = 'ONE_SIGNAL_API_KEY';

@Injectable()
export class OneSignalClient {
  private readonly logger = new Logger(OneSignalClient.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configs: ConfigService,
  ) {}

  public sendPriceChangeNotification(
    users: UserDevice[],
    token: TokenPrice,
    priceDeviation: number,
  ): void {
    const { assetId, token: symbol, price, fullName } = token;
    this.logger.debug(`Sending price change notification for token ${symbol}`);

    const userIds = users.map((user) => user.deviceId);

    if (userIds.length === 0) {
      return;
    }

    const oneSignalApi = this.configs.get(ONE_SIGNAL_API);
    const oneSignalAppId = this.configs.get(ONE_SIGNAL_APP_ID);
    const oneSignalApiKey = this.configs.get(ONE_SIGNAL_API_KEY);

    const title = 'Price Alert';
    const priceFormatted = new Big(price).toFixed();
    const message =
      priceDeviation > 0
        ? `🚀 ${fullName} price changed by ${priceDeviation.toFixed(
            2,
          )}%! Current price: ${priceFormatted}$`
        : `🔻 ${fullName} price changed by ${priceDeviation.toFixed(
            2,
          )}%! Current price: ${priceFormatted}$`;

    const headers = {
      Authorization: `Basic ${oneSignalApiKey}`,
      accept: 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    };
    const data = {
      app_id: oneSignalAppId,
      include_aliases: { external_id: userIds },
      contents: { en: message },
      data: { assetId, symbol },
      headings: { en: title },
      target_channel: 'push',
    };

    this.sendPostRequest(oneSignalApi, headers, data);
  }

  private sendPostRequest<T>(
    oneSignalApi: string,
    headers: { Authorization: string; accept: string; 'Content-Type': string },
    data: T,
  ): void {
    firstValueFrom(
      this.httpService
        .post(oneSignalApi, data, { headers, timeout: 10000 })
        .pipe(
          retry({ count: 10, delay: 2000 }),
          catchError((error: AxiosError) => {
            this.logError<T>(error, data);

            return of();
          }),
        ),
    );
  }

  private logError<T>(error: AxiosError, data: T): void {
    this.logger.error(
      `An error occurred while contacting One signal API! 
      Msg: ${error.message}
      Code: ${error.code}
      Cause: ${error.cause}, 
      Data: ${JSON.stringify(data)}`,
    );
  }
}
