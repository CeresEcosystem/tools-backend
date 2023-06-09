import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { TrackerService } from './tracker.service';
import { VALTrackerBlockBcToEntityMapper } from './mapper/val-tracker-block-bc-to-entity.mapper';
import { ValTrackerBlockDto } from './dto/val-tracker-bc-block';
import { WsProvider } from '@polkadot/rpc-provider';
import { PROVIDER } from '../../constants/constants';
import { ApiPromise } from '@polkadot/api/promise';
import { options } from '@sora-substrate/api';
import { FPNumber } from '@sora-substrate/math';
import { DENOMINATOR } from './tracker.constants';

const techAccount = 'cnTQ1kbv7PBNNQrEb1tZpmK7hhnohXfYrx5GuD1H9ShjdGoBh';

@Injectable()
export class TrackerValSync {
  private readonly logger = new Logger(TrackerValSync.name);
  private soraApi;

  constructor(
    private readonly trackerService: TrackerService,
    private readonly mapper: VALTrackerBlockBcToEntityMapper,
  ) {
    const provider = new WsProvider(PROVIDER);
    new ApiPromise(options({ provider, noInitWarn: true })).isReady.then(
      (api) => {
        this.soraApi = api;
      },
    );
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async fetchTrackerData(): Promise<void> {
    this.logger.log('Start fetching VAL burning data.');

    const burningData: ValTrackerBlockDto[] = [];
    const startBlock = await this.trackerService.findLastBlockNumber('VAL');
    const headBlock = await this.soraApi.query.system.number();

    for (let blockNum = startBlock; blockNum <= headBlock; blockNum++) {
      const blockHash = await this.soraApi.rpc.chain.getBlockHash(blockNum);
      const apiAt = await this.soraApi.at(blockHash);
      let events = await apiAt.query.system.events();
      let found = false;
      events = events.toHuman();

      events.forEach((e, _) => {
        const module = e.event.section;
        const event = e.event.method;
        if (module === 'session' && event === 'NewSession') {
          events.forEach((ev, iddx) => {
            if (found) return;
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
                  dateRaw: '',
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

    await this.trackerService.insert(this.mapper.toEntities(burningData));

    this.logger.log('Fetching of VAL burning data was successful!');
  }
}
