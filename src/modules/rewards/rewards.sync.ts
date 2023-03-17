import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, of, retry } from 'rxjs';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { RewardsDto } from './rewards.dto';
import { RewardsService } from './rewards.service';

const LP_URL = 'https://api.cerestoken.io/lp';

@Injectable()
export class RewardsSync {
  private readonly logger = new Logger(RewardsSync.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly rewardsService: RewardsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchFarmingRewards(): Promise<void> {
    this.logger.log('Start downloading farming rewards.');

    const { data: rewards } = await firstValueFrom(
      this.httpService.get<RewardsDto>(LP_URL, { timeout: 2000 }).pipe(
        retry({ count: 30, delay: 1000 }),
        catchError((error: AxiosError) => {
          this.logger.warn(
            `An error happened while fetching farming rewards! msg: ${error.message}, code: ${error.code}, cause: ${error.cause}`,
          );
          return of({ data: undefined });
        }),
      ),
    );

    if (!rewards) {
      return;
    }

    this.rewardsService.save(rewards);

    this.logger.log('Downloading of farming rewards was successful!');
  }
}
