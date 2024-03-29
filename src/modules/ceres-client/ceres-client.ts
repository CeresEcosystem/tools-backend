import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, retry } from 'rxjs';
import { TokenLockDto } from './dto/token-lock.dto';
import { LiquidityLockDto } from './dto/liquidity-lock.dto';
import { AxiosError } from 'axios';

const CERES_BACKEND_URL = 'CERES_BACKEND_URL';

@Injectable()
export class CeresClient {
  private readonly logger = new Logger(CeresClient.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configs: ConfigService,
  ) {}

  public getTokenLocks(): Promise<TokenLockDto[]> {
    const url = `${this.configs.get(CERES_BACKEND_URL)}/lock/tokens/totals`;

    return this.sendGetRequest<TokenLockDto[]>(url);
  }

  public getLiquidityLocks(): Promise<LiquidityLockDto[]> {
    const url = `${this.configs.get(CERES_BACKEND_URL)}/lock/pairs/totals`;

    return this.sendGetRequest<LiquidityLockDto[]>(url);
  }

  private async sendGetRequest<T>(url: string): Promise<T> {
    const { data } = await firstValueFrom(
      this.httpService.get<T>(url, { timeout: 1000 }).pipe(
        retry({ count: 10, delay: 1000 }),
        catchError((error: AxiosError) => {
          this.logError(error, url);
          throw new BadGatewayException('Ceres backend unreachable.');
        }),
      ),
    );

    return data;
  }

  private logError(error: AxiosError, url: string): void {
    this.logger.error(
      `An error happened while contacting ceres-backend!
      msg: ${error.message}, code: ${error.code}, cause: ${error.cause}, url: ${url}`,
    );
  }
}
