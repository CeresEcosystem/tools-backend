import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
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
      this.httpService.get<RewardsDto>(LP_URL),
    );

    this.rewardsService.save(rewards);

    this.logger.log('Downloading of farming rewards was successful!');
  }
}
