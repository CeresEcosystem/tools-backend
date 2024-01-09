import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, retry } from 'rxjs';
import { AxiosError } from 'axios';
import { DeoStakingDto } from './dto/deo-staking.dto';
import { DeoFarmingDto } from './dto/deo-farming.dto';

const { DEO_BACKEND_URL } = process.env;

@Injectable()
export class DeoClient {
  private readonly logger = new Logger(DeoClient.name);
  constructor(private readonly httpService: HttpService) {}

  public fetchStakingData(accountId: string): Promise<DeoStakingDto[]> {
    const url = `${DEO_BACKEND_URL}/demeter/stakings?accountId=${accountId}`;

    return this.sendGetRequest<DeoStakingDto[]>(url);
  }

  public fetchFarmingData(accountId: string): Promise<DeoFarmingDto[]> {
    const url = `${DEO_BACKEND_URL}/demeter/farms?accountId=${accountId}`;

    return this.sendGetRequest<DeoFarmingDto[]>(url);
  }

  private async sendGetRequest<T>(url: string): Promise<T> {
    const { data } = await firstValueFrom(
      this.httpService.get<T>(url, { timeout: 10000 }).pipe(
        retry({ count: 5, delay: 1000 }),
        catchError((error: AxiosError) => {
          this.logWarning(error);
          throw new BadGatewayException('Deo backend unreachable.');
        }),
      ),
    );

    return data;
  }

  private logWarning(error: AxiosError): void {
    this.logger.error(
      `An error happened while contacting deo-backend!
      msg: ${error.message}, code: ${error.code}, cause: ${error.cause}`,
    );
  }
}
