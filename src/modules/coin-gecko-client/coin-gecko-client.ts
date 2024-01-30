import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, retry } from 'rxjs';
import { MarketCapDto } from './dto/get-market-cap.dto';
import { TokenMarketCapDto } from '../market-cap/dto/token-market-cap.dto';
import {
  COIN_GECKO_TOKEN_SYMBOLS,
  SYMBOLS_AND_GECKO_IDS,
} from 'src/constants/constants';

const COINGECKO_API = 'COINGECKO_API';

@Injectable()
export class CoinGeckoClient {
  private readonly logger = new Logger(CoinGeckoClient.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configs: ConfigService,
  ) {}

  public async getTokensMarketCaps(
    coinIds: string[],
  ): Promise<TokenMarketCapDto[]> {
    const url = `${this.configs.get(
      COINGECKO_API,
    )}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}`;

    const response = await this.sendGetRequest<MarketCapDto[]>(url);

    return response.map((marketCapDto) => ({
      tokenSymbol: this.getSymbolByTokenId(marketCapDto.id),
      marketCap: marketCapDto.market_cap,
    }));
  }

  private getSymbolByTokenId(value: string): string {
    return COIN_GECKO_TOKEN_SYMBOLS.find(
      (key) => SYMBOLS_AND_GECKO_IDS[key] === value,
    );
  }

  private async sendGetRequest<T>(url: string): Promise<T> {
    const { data } = await firstValueFrom(
      this.httpService.get<T>(url, { timeout: 1000 }).pipe(
        retry({ count: 10, delay: 1000 }),
        catchError((error) => {
          this.logError(error, url);
          throw new BadGatewayException('CoinGecko api unreachable.');
        }),
      ),
    );

    return data;
  }

  private logError(error: AxiosError, url: string): void {
    this.logger.error(
      `An error happened while contacting CoinGecko!
      msg: ${error.message}, code: ${error.code}, cause: ${error.cause}, url: ${url}`,
    );
  }
}
