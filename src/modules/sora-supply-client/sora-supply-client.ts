import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, retry } from 'rxjs';
import { SoraTokenSupplyDto } from './dto/sora-tokens-supply.dto';

const SORA_API = 'SORA_API';

@Injectable()
export class SoraSupplyClient {
  private readonly logger = new Logger(SoraSupplyClient.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configs: ConfigService,
  ) {}

  public async getSoraTokensSupply(
    tokens: string[],
  ): Promise<SoraTokenSupplyDto[]> {
    try {
      return await Promise.all(
        tokens.map(async (token) => {
          const url = `${this.configs.get(SORA_API)}/qty/${token}`;
          let supply = await this.sendGetRequest<number | string>(url);

          if (!supply) {
            supply = 0;
          }

          if (typeof supply === 'string') {
            supply = parseFloat(supply);
          }

          return {
            token,
            supply,
          };
        }),
      );
    } catch (error) {
      const axiosError = (
        error as BadGatewayException
      ).getResponse() as AxiosError;

      this.logError(axiosError, this.configs.get(SORA_API));
      throw new Error('Aborting, Sora supply api unreachable.');
    }
  }

  private async sendGetRequest<T>(url: string): Promise<T> {
    const { data } = await firstValueFrom(
      this.httpService.get<T>(url, { timeout: 3000 }).pipe(
        retry({ count: 5, delay: 5000 }),
        catchError((error) => {
          throw new BadGatewayException(error);
        }),
      ),
    );

    return data;
  }

  private logError(error: AxiosError, url: string): void {
    this.logger.error(
      `An error happened while contacting Sora Supply Api!
      msg: ${error.message}, code: ${error.code}, cause: ${error.cause}, url: ${url}`,
    );
  }
}
