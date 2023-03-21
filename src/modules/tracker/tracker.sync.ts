import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { TrackerBlockBcToEntityMapper } from './mapper/tracker-block-bc-to-entity.mapper';
import { TrackerService } from './tracker.service';
import { FPNumber } from '@sora-substrate/math';
import { WsProvider } from '@polkadot/rpc-provider';
import { PROVIDER } from '../../constants/constants';
import { ApiPromise } from '@polkadot/api/promise';
import { options } from '@sora-substrate/api';

const DENOMINATOR = FPNumber.fromNatural(Math.pow(10, 18));
const DAY = 14400;

@Injectable()
export class TrackerSync {
  private readonly logger = new Logger(TrackerSync.name);
  private soraApi;

  constructor(
    private readonly httpService: HttpService,
    private readonly trackerService: TrackerService,
    private readonly mapper: TrackerBlockBcToEntityMapper,
  ) {
    const provider = new WsProvider(PROVIDER);
    new ApiPromise(options({ provider, noInitWarn: true })).isReady.then(
      (api) => {
        this.soraApi = api;
      },
    );
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async fetchTrackerData(): Promise<void> {
    this.logger.log('Start fetching burning data.');

    let burningData = [];
    const lastBlock = parseInt(await this.trackerService.findMaxBlockNumber());
    const headNum = await this.soraApi.query.system.number();
    const blocksWithDistribution = await this.getAllBlocksWithDistribution(
      headNum,
    );
    const filtered = blocksWithDistribution.filter(
      (blockTemp) => blockTemp > lastBlock,
    );

    for (const blockNum of filtered) {
      const distributions = await this.parseBlockWithDistribution(blockNum);
      let retStr = '';
      for (let elem of distributions) {
        retStr = blockNum.toString();
        for (let x of elem) {
          retStr = retStr + ',' + new FPNumber(x).div(DENOMINATOR).toString();
        }
        retStr = retStr.slice(0, -1);
        if (retStr !== '') burningData.push(retStr);
      }
    }

    if (!burningData || burningData.length === 0) {
      this.logger.log('No new burning data to load, exiting.');
      return;
    }

    this.logger.log(`Number of entries to load: ${burningData.length}`);

    this.trackerService.save(this.mapper.toEntities(burningData));

    this.logger.log('Fetching of burning data was successful!');
  }

  private async getAllBlocksWithDistribution(endBlock): Promise<any> {
    let blocksWithDistribution = [];
    let queryResult =
      await this.soraApi.query.pswapDistribution.subscribedAccounts.entries();
    for (let [_, v] of queryResult) {
      v = v.toHuman();
      let poolCreated = new FPNumber(v[3]).toNumber();
      let blockNum = poolCreated + DAY;
      for (; blockNum < endBlock; blockNum += DAY) {
        blocksWithDistribution.push(blockNum);
      }
    }

    return blocksWithDistribution.sort();
  }

  private async parseBlockWithDistribution(blockNum): Promise<any> {
    let result = [];
    let blockHash = await this.soraApi.rpc.chain.getBlockHash(blockNum);
    const apiAt = await this.soraApi.at(blockHash);
    let events = await apiAt.query.system.events();
    events = events.toHuman();

    events.forEach((e, idx) => {
      const module = e.event.section;
      const evnt = e.event.method;

      if (module === 'pswapDistribution' && evnt === 'FeesExchanged') {
        if (
          events.length > idx + 4 &&
          events[idx + 4].event.method === 'IncentiveDistributed'
        ) {
          let xorSpent = e.event.data[3];
          let pswapGrossBurn = e.event.data[5];
          let pswapRemintedLp = events[idx + 2].event.data.amount;
          let pswapRemintedParliament = events[idx + 3].event.data.amount;
          let pswapNetBurn =
            new FPNumber(pswapGrossBurn).toNumber() -
            new FPNumber(pswapRemintedParliament).toNumber() -
            new FPNumber(pswapRemintedLp).toNumber();

          result.push([
            xorSpent,
            pswapGrossBurn,
            pswapRemintedLp,
            pswapRemintedParliament,
            pswapNetBurn,
          ]);
        }
      }
    });

    return result;
  }
}
