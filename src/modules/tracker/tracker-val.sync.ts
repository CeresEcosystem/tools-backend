import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { TrackerService } from './tracker.service';
import { FPNumber } from '@sora-substrate/math';
import { DENOMINATOR } from './tracker.constants';
import { ValFeesTrackerBlockBcToEntityMapper } from './mapper/val-fees-tracker-to-entity.mapper';
import { ValFeesTrackerBlockDto } from './dto/val-fees-tracker-bc-block';
import { SoraClient } from '../sora-client/sora-client';

const techAccount = 'cnTQ1kbv7PBNNQrEb1tZpmK7hhnohXfYrx5GuD1H9ShjdGoBh';

@Injectable()
export class TrackerValSync {
  private readonly logger = new Logger(TrackerValSync.name);

  constructor(
    private readonly trackerService: TrackerService,
    private readonly mapper: ValFeesTrackerBlockBcToEntityMapper,
    private readonly soraClient: SoraClient,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async fetchTrackerData(): Promise<void> {
    this.logger.log('Start fetching VAL burning data.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();

    const burningData: ValFeesTrackerBlockDto[] = [];
    const lastSavedBlock = await this.trackerService.findLastBlockNumber(
      'VAL',
      'FEES',
    );
    const startBlock = lastSavedBlock + 1;
    const headBlock = await soraApi.query.system.number();

    for (let blockNum = startBlock; blockNum <= headBlock; blockNum += 1) {
      const blockHash = await soraApi.rpc.chain.getBlockHash(blockNum);
      const apiAt = await soraApi.at(blockHash);
      let events = await apiAt.query.system.events();
      let found = false;
      events = events.toHuman();

      events.forEach((e) => {
        const module = e.event.section;
        const event = e.event.method;

        if (module === 'session' && event === 'NewSession') {
          events.forEach((ev, iddx) => {
            if (found) {
              return;
            }

            const module = ev.event.section;
            const event = ev.event.method;
            if (module === 'balances' && event === 'Deposit') {
              const accountId = ev.event.data.who;
              if (accountId === techAccount) {
                const xorDedicatedForBuyBack = new FPNumber(
                  ev.event.data.amount,
                )
                  .div(DENOMINATOR)
                  .toString();

                let valBurned;
                try {
                  valBurned = new FPNumber(events[iddx + 7].event.data[3])
                    .div(DENOMINATOR)
                    .toNumber();
                } catch (e) {
                  valBurned = new FPNumber(events[iddx + 8].event.data[3])
                    .div(DENOMINATOR)
                    .toNumber();
                }

                const valRemintedParliament = (valBurned * 0.1).toString();
                found = true;

                burningData.push({
                  blockNum,
                  valBurned: valBurned.toString(),
                  valRemintedParliament,
                  xorDedicatedForBuyBack,
                  xorTotalFee: xorDedicatedForBuyBack,
                });
              }
            }
          });
        }
      });
    }

    if (!burningData || burningData.length === 0) {
      this.logger.log('No new VAL burning data to load, exiting.');

      return;
    }

    this.logger.log(`Number of entries to load: ${burningData.length}`);

    await this.trackerService.upsert(this.mapper.toEntities(burningData));

    this.logger.log('Fetching of VAL burning data was successful!');
  }
}
