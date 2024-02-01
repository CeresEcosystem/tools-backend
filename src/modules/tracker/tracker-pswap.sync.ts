/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { PSWAPTrackerBlockBcToEntityMapper } from './mapper/pswap-tracker-to-entity.mapper';
import { TrackerService } from './tracker.service';
import { FPNumber } from '@sora-substrate/math';
import { DENOMINATOR } from './tracker.constants';
import { SoraClient } from '../sora-client/sora-client';
import { TrackerBurnService } from './tracker-burn.service';
import { BurnType } from './entity/tracker.entity';
import { TrackerSummaryService } from './tracker-summary.service';

const DAY = 14400;
const PSWAP_TOKEN = 'PSWAP';

@Injectable()
export class TrackerPswapSync {
  private readonly logger = new Logger(TrackerPswapSync.name);

  constructor(
    private readonly trackerService: TrackerService,
    private readonly trackerBurnService: TrackerBurnService,
    private readonly trackerSummaryService: TrackerSummaryService,
    private readonly mapper: PSWAPTrackerBlockBcToEntityMapper,
    private readonly soraClient: SoraClient,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async fetchTrackerData(): Promise<void> {
    this.logger.log('Start fetching PSWAP burning data.');
    const soraApi: any = await this.soraClient.getSoraApi();

    const burningData = [];
    const startBlock = await this.trackerService.findLastBlockNumber(
      PSWAP_TOKEN,
      BurnType.FEES,
    );

    this.logger.debug(`StartBlock: ${startBlock}`);

    const headBlock = await soraApi.query.system.number();
    const blocksWithDistribution = await this.getAllBlocksWithDistribution(
      startBlock,
      headBlock,
    );

    this.logger.debug(
      `BlocksWithDistribution array size: ${blocksWithDistribution.length}`,
    );

    for (const blockNum of blocksWithDistribution) {
      const distributions = await this.parseBlockWithDistribution(blockNum);
      let retStr = '';
      for (const elem of distributions) {
        retStr = blockNum.toString();
        for (const x of elem) {
          retStr = `${retStr },${ new FPNumber(x).div(DENOMINATOR).toString()}`;
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

    await this.trackerService.upsert(this.mapper.toEntities(burningData));

    await this.trackerBurnService.cacheBurningChartData(PSWAP_TOKEN);
    await this.trackerSummaryService.cacheBurningSummaryData(PSWAP_TOKEN);

    this.logger.log('Fetching of PSWAP burning data was successful!');
  }

  private async getAllBlocksWithDistribution(
    startBlock: number,
    endBlock: number,
  ): Promise<any> {
    const soraApi: any = await this.soraClient.getSoraApi();
    const blocksWithDistribution = new Set<number>();
    const queryResult =
      await soraApi.query.pswapDistribution.subscribedAccounts.entries();

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
    const soraApi: any = await this.soraClient.getSoraApi();
    const result = [];
    const blockHash = await soraApi.rpc.chain.getBlockHash(blockNum);
    const apiAt = await soraApi.at(blockHash);
    let events = await apiAt.query.system.events();
    events = events.toHuman();

    this.logger.debug(`Events array count: ${events.length}`);

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

          this.logger.debug(`Adding event - xorSpent: ${xorSpent}`);

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
