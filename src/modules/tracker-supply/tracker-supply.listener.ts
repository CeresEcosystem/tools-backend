import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { TrackerSupplyService } from './tracker-supply.service';

const PSWAP_SUPPLY_URL = 'https://mof.sora.org/qty/pswap';

@Injectable()
export class TrackerSupplyListener {
  private readonly logger = new Logger(TrackerSupplyListener.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly trackerSupplyService: TrackerSupplyService,
  ) {}

  // TODO: Phase II - Refactor this class to listen to changes on BC.

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchLiquidityPairs(): Promise<void> {
    this.logger.log('Start downloading PSWAP supply.');

    const { data: trackerSupply } = await firstValueFrom(
      this.httpService.get(PSWAP_SUPPLY_URL),
    );

    this.trackerSupplyService.save(trackerSupply);

    this.logger.log('Downloading of PSWAP supply was successful!');
  }
}
