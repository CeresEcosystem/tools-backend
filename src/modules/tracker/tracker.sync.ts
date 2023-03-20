import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, of, retry } from 'rxjs';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { TrackerBlockBcToEntityMapper } from './mapper/tracker-block-bc-to-entity.mapper';
import { TrackerService } from './tracker.service';

const BURNING_DATA_URL =
  'https://tracker.cerestoken.io/pswap-burning-data?block=';

@Injectable()
export class TrackerSync {
  private readonly logger = new Logger(TrackerSync.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly trackerService: TrackerService,
    private readonly mapper: TrackerBlockBcToEntityMapper,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async fetchPswapSupply(): Promise<void> {
    this.logger.log('Start downloading burning data.');

    const lastBlock = await this.trackerService.findMaxBlockNumber();

    const { data: burningData } = await firstValueFrom(
      this.httpService
        .get<string[]>(`${BURNING_DATA_URL}${lastBlock}`, { timeout: 60_000 })
        .pipe(
          retry({ count: 30, delay: 1000 }),
          catchError((error: AxiosError) => {
            this.logger.warn(
              `An error happened while fetching PSWAP supply! msg: ${error.message}, code: ${error.code}, cause: ${error.cause}`,
            );
            return of({ data: undefined });
          }),
        ),
    );

    if (!burningData || burningData.length === 0) {
      this.logger.log('No new burning data to load, exiting.');
      return;
    }

    this.logger.log(`Number of entries to load: ${burningData.length}`);

    this.trackerService.save(this.mapper.toEntities(burningData));

    this.logger.log('Downloading of burning data was successful!');
  }
}
