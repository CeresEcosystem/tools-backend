import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, of, retry } from 'rxjs';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { TrackerSupplyService } from './tracker-supply.service';

const PSWAP_SUPPLY_URL = 'https://mof.sora.org/qty/pswap';

@Injectable()
export class TrackerSupplySync {
  private readonly logger = new Logger(TrackerSupplySync.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly trackerSupplyService: TrackerSupplyService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async fetchPswapSupply(): Promise<void> {
    this.logger.log('Start downloading PSWAP supply.');

    const { data: trackerSupply } = await firstValueFrom(
      this.httpService.get<string>(PSWAP_SUPPLY_URL, { timeout: 2000 }).pipe(
        retry({ count: 30, delay: 1000 }),
        catchError((error: AxiosError) => {
          this.logger.warn(
            `An error happened while fetching PSWAP supply! msg: ${error.message}, code: ${error.code}, cause: ${error.cause}`,
          );
          return of({ data: undefined });
        }),
      ),
    );

    if (!trackerSupply) {
      return;
    }

    this.trackerSupplyService.save(trackerSupply);

    this.logger.log('Downloading of PSWAP supply was successful!');
  }
}
