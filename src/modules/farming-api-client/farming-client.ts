import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError, of, retry } from 'rxjs';
import { AxiosError } from 'axios';
import { StakingClientDto } from './dto/staking-client.dto';
import { FarmingClientDto } from './dto/farming-client.dto';

const CERES_STAKING_URL = 'CERES_STAKING_URL';
const CERES_FARMING_URL = 'CERES_FARMING_URL';

@Injectable()
export class FarmingClient {
  private readonly logger = new Logger(FarmingClient.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public async fetchStakingData(
    accountId: string,
  ): Promise<StakingClientDto[]> {
    const url =
      this.configService.get(CERES_STAKING_URL) + `?accountId=${accountId}`;
    return this.sendGetRequest<StakingClientDto[]>(url);
  }

  public async fetchFarmingData(
    accountId: string,
  ): Promise<FarmingClientDto[]> {
    const url =
      this.configService.get(CERES_FARMING_URL) + `?accountId=${accountId}`;
    return this.sendGetRequest<FarmingClientDto[]>(url);
  }

  private async sendGetRequest<T>(url: string) {
    const { data } = await firstValueFrom(
      this.httpService.get<T>(url, { timeout: 1000 }).pipe(
        retry({ count: 10, delay: 1000 }),
        catchError((error: AxiosError) => {
          this.logWarning(error);
          return of({ data: undefined });
        }),
      ),
    );

    return data;
  }

  private logWarning(error: AxiosError) {
    this.logger.warn(
      `An error happened while contacting farming-backend! msg: ${error.message}, code: ${error.code}, cause: ${error.cause}`,
    );
  }
}
