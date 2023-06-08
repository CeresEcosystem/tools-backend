import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { TrackerService } from './tracker.service';
import { VALTrackerBlockBcToEntityMapper } from './mapper/val-tracker-block-bc-to-entity.mapper';
import { ValTrackerBlockDto } from './dto/val-tracker-bc-block';

@Injectable()
export class TrackerValSync {
  private readonly logger = new Logger(TrackerValSync.name);

  constructor(
    private readonly trackerService: TrackerService,
    private readonly mapper: VALTrackerBlockBcToEntityMapper,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES, { disabled: true })
  async fetchTrackerData(): Promise<void> {
    this.logger.log('Start fetching burning data.');

    const burningData: ValTrackerBlockDto[] = [];
    // const startBlock = await this.trackerService.findLastBlockNumber('VAL');

    //TODO: implement VAL burning data sync

    if (!burningData || burningData.length === 0) {
      this.logger.log('No new VAL burning data to load, exiting.');
      return;
    }

    this.logger.log(`Number of entries to load: ${burningData.length}`);

    await this.trackerService.insert(this.mapper.toEntities(burningData));

    this.logger.log('Fetching of burning data was successful!');
  }
}
