import { Injectable, Logger } from '@nestjs/common';
import {
  DENOMINATOR,
  VAL_BURN_ADDRESS,
  VAL_TOKEN_ID,
} from './tracker.constants';
import { FPNumber } from '@sora-substrate/math';
import { TrackerService } from './tracker.service';
import { ValTbcTrackerToEntityMapper } from './mapper/val-tbc-tracker-to-entity.mapper';
import { SoraClient } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class TrackerValTbcBurningsListener {
  private readonly logger = new Logger(TrackerValTbcBurningsListener.name);

  constructor(
    private readonly trackerService: TrackerService,
    private readonly mapper: ValTbcTrackerToEntityMapper,
    private readonly soraClient: SoraClient,
  ) {
    this.runListener();
  }

  async runListener(): Promise<void> {
    this.logger.log('VAL TBC burning listener initialized');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();

    soraApi.rpc.chain.subscribeNewHeads(async (header) => {
      const blockHash = await soraApi.rpc.chain.getBlockHash(header.number);
      const block = await soraApi.at(blockHash);
      const events = await block.query.system.events();

      let burnTotal = new FPNumber(0);

      for (const event of events) {
        if (
          event.event.section === 'tokens' &&
          event.event.method === 'Withdrawn'
        ) {
          const data = event.event.data.toHuman();

          if (
            data.currencyId.code === VAL_TOKEN_ID &&
            data.who === VAL_BURN_ADDRESS
          ) {
            const amount = new FPNumber(data.amount);
            burnTotal = burnTotal.add(amount);
          }
        }
      }

      const blockNum = new FPNumber(header.number.toHuman()).toNumber();
      const valBurned = burnTotal.div(DENOMINATOR).toString();

      if (Number(valBurned) !== 0) {
        this.logger.debug(`At block #${blockNum}: ${valBurned} VAL was burned`);

        const burningData = {
          blockNum,
          valBurned,
        };

        await this.trackerService.upsert([this.mapper.toEntity(burningData)]);
      }
    });
  }
}
