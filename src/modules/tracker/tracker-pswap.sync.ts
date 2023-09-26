import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { PSWAPTrackerBlockBcToEntityMapper } from './mapper/pswap-tracker-to-entity.mapper';
import { TrackerService } from './tracker.service';
import { FPNumber } from '@sora-substrate/math';
import { WsProvider } from '@polkadot/rpc-provider';
import { PROVIDER } from '../../constants/constants';
import { ApiPromise } from '@polkadot/api/promise';
import { options } from '@sora-substrate/api';
import { DENOMINATOR } from './tracker.constants';

const DAY = 14400;

@Injectable()
export class TrackerPswapSync {
  private readonly logger = new Logger(TrackerPswapSync.name);
  private soraApi;

  constructor(
    private readonly trackerService: TrackerService,
    private readonly mapper: PSWAPTrackerBlockBcToEntityMapper,
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
    this.logger.log('Start fetching PSWAP burning data.');

    const burningData = [];
    const startBlock = await this.trackerService.findLastBlockNumber('PSWAP');
    const headBlock = await this.soraApi.query.system.number();
    const blocksWithDistribution = await this.getAllBlocksWithDistribution(
      startBlock,
      headBlock,
    );

    for (const blockNum of blocksWithDistribution) {
      const distributions = await this.parseBlockWithDistribution(blockNum);
      let retStr = '';
      for (const elem of distributions) {
        retStr = blockNum.toString();
        for (const x of elem) {
          retStr = retStr + ',' + new FPNumber(x).div(DENOMINATOR).toString();
        }
        retStr = retStr.slice(0, -1);
        if (retStr !== '') {
          burningData.push(retStr);
        }
      }
    }

    if (!burningData || burningData.length === 0) {
      this.logger.log('No new burning data to load, exiting.');
      return;
    }

    this.logger.log(`Number of entries to load: ${burningData.length}`);

    await this.trackerService.insert(this.mapper.toEntities(burningData));

    this.logger.log('Fetching of PSWAP burning data was successful!');
  }

  private async getAllBlocksWithDistribution(
    startBlock: number,
    endBlock: number,
  ): Promise<any> {
    const blocksWithDistribution = new Set<number>();
    const queryResult =
      await this.soraApi.query.pswapDistribution.subscribedAccounts.entries();

    for (let [, v] of queryResult) {
      v = v.toHuman();
      const poolCreated = new FPNumber(v[3]).toNumber();
      let blockNum = poolCreated + DAY;
      for (; blockNum < endBlock; blockNum += DAY) {
        if (blockNum > startBlock) {
          blocksWithDistribution.add(blockNum);
        }
      }
    }

    return [...blocksWithDistribution].sort((a, b) => a - b);
  }

  private async parseBlockWithDistribution(blockNum): Promise<any> {
    const result = [];
    const blockHash = await this.soraApi.rpc.chain.getBlockHash(blockNum);
    const apiAt = await this.soraApi.at(blockHash);
    let events = await apiAt.query.system.events();
    events = events.toHuman();

    events.forEach((e, idx) => {
      const module = e.event.section;
      const event = e.event.method;

      if (
        module === 'pswapDistribution' &&
        event === 'FeesExchanged' &&
        events.length >= idx + 20
      ) {
        if (
          events.length > idx + 4 &&
          events[idx + 20].event.method === 'IncentiveDistributed'
        ) {
          const xorSpent = e.event.data[3];
          const grossBurn = e.event.data[5];
          const remintedLp = events[idx + 2].event.data.amount;
          const remintedParliament = events[idx + 3].event.data.amount;
          const netBurn =
            new FPNumber(grossBurn).toNumber() -
            new FPNumber(remintedParliament).toNumber() -
            new FPNumber(remintedLp).toNumber();

          result.push([
            xorSpent,
            grossBurn,
            remintedLp,
            remintedParliament,
            netBurn,
          ]);
        }
      }
    });

    return result;
  }
}
