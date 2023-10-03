import { Injectable, Logger } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  DENOMINATOR,
  VAL_BURN_ADDRESS,
  VAL_TOKEN_ID,
} from './tracker.constants';
import { FPNumber } from '@sora-substrate/math';
import { options } from '@sora-substrate/api';
import { TrackerService } from './tracker.service';
import { ValTbcTrackerToEntityMapper } from './mapper/val-tbc-tracker-to-entity.mapper';
import { PROVIDER } from 'src/constants/constants';

@Injectable()
export class TrackerValTbcBurningsListener {
  private readonly logger = new Logger(TrackerValTbcBurningsListener.name);
  private soraApi;

  constructor(
    private readonly trackerService: TrackerService,
    private readonly mapper: ValTbcTrackerToEntityMapper,
  ) {
    const provider = new WsProvider(PROVIDER);
    new ApiPromise(options({ provider, noInitWarn: true })).isReady.then(
      (api) => {
        this.soraApi = api;
        this.runListener();
      },
    );
  }

  async runListener() {
    this.logger.log('VAL TBC burning listener initialized');

    this.soraApi.rpc.chain.subscribeNewHeads(async (header) => {
      const blockHash = await this.soraApi.rpc.chain.getBlockHash(
        header.number,
      );

      const events = await (
        await this.soraApi.at(blockHash)
      ).query.system.events();

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
