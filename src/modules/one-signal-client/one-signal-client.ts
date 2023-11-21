/* eslint-disable camelcase */
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosResponse } from 'axios';
import { Observable, catchError, retry } from 'rxjs';
import { UserDevice } from '../price-notifications/entity/user-device.entity';
import { TokenPrice } from '../token-price/entity/token-price.entity';

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
  ): void {
    const userIds = users.map((user) => user.deviceId);

    if (userIds.length === 0) {
      return;
    }

    const oneSignalApi = this.configs.get(ONE_SIGNAL_API);
    const oneSignalAppId = this.configs.get(ONE_SIGNAL_APP_ID);
    const oneSignalApiKey = this.configs.get(ONE_SIGNAL_API_KEY);

    const title = 'Price Alert';
    const message = `${token.fullName} price changed more than 5%! New price: ${token.price}$`;
    const headers = {
      Authorization: `Basic ${oneSignalApiKey}`,
      accept: 'application/json',
      'Content-Type': 'application/json; charset=UTF-8',
    };
    const data = {
      app_id: oneSignalAppId,
      include_aliases: { external_id: userIds },
      contents: { en: message },
      data: { assetId: token.assetId, symbol: token.token },
      headings: { en: title },
      target_channel: 'push',
    };

    const response = this.sendPostRequest(oneSignalApi, headers, data);
    response.subscribe((value) => value);
  }

  private sendPostRequest<T>(
    oneSignalApi: string,
    headers: { Authorization: string; accept: string; 'Content-Type': string },
    data: T,
  ): Observable<AxiosResponse<T, unknown>> {
    return this.httpService
      .post<T>(oneSignalApi, data, { headers, timeout: 1000 })
      .pipe(
        retry({ count: 10, delay: 1000 }),
        catchError((error: AxiosError) => {
          this.logWarning(error);
          throw new BadGatewayException('OneSignal API unreachable');
        }),
      );
  }

  private logWarning(error: AxiosError): void {
    this.logger.warn(`An error occurred while contacting One signal API!
                     Msg: ${error.message}, code: ${error.code}, cause: ${error.cause}`);
  }
}
