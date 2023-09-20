import { Injectable, Logger } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  DENOMINATOR,
  PROVIDER,
  VAL_BURN_ADDRESS,
  VAL_TOKEN_ID,
} from './tracker.constants';
import { FPNumber } from '@sora-substrate/math';

@Injectable()
export class TrackerVALTBCBurningsListener {
  private readonly logger = new Logger(TrackerVALTBCBurningsListener.name);
  private soraAPI;

  constructor() {
    const provider = new WsProvider(PROVIDER);
    this.soraAPI = new ApiPromise({ provider, noInitWarn: true });
  }

  async runListener() {
    this.logger.log('Val burning listener initialized');

    await this.soraAPI.isReady;

    let previousBlock = '';
    let previousAmount = '';

    this.soraAPI.rpc.chain.subscribeNewHeads(async (header) => {
      const blockHash = await this.soraAPI.rpc.chain.getBlockHash(
        header.number,
      );

      const events = await (
        await this.soraAPI.at(blockHash)
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
            burnTotal.add(new FPNumber(data.amount));
          }
        }
      }

      const newBlock = header.number.toHuman().replace(/,/g, '');
      const newAmount = new FPNumber(burnTotal.toString())
        .div(DENOMINATOR)
        .toString();

      if (
        burnTotal !== new FPNumber(0) &&
        previousBlock != newBlock &&
        previousAmount != newAmount
      ) {
        console.log(`At block #${newBlock}: ${newAmount} VAL was burned`);

        previousBlock = newBlock;
        previousAmount = newAmount;
      }
    });
  }
}
