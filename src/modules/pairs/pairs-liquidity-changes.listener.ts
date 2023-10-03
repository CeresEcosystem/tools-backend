import { Injectable, Logger } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { options } from '@sora-substrate/api';

import { PROVIDER } from 'src/constants/constants';
import {
  parsePoolXYKDepositArgs,
  parsePoolXYKWithdrawArgs,
} from './pairs-liquidity-changes.utils';
import { FPNumber } from '@sora-substrate/math';

@Injectable()
export class PairsLiquidityChangesListener {
  private readonly logger = new Logger(PairsLiquidityChangesListener.name);
  private soraAPI;

  constructor() {
    const provider = new WsProvider(PROVIDER);
    new ApiPromise(options({ provider, noInitWarn: true })).isReady.then(
      (api) => {
        this.soraAPI = api;
        this.runListener();
      },
    );
  }

  async runListener() {
    this.logger.log('Pairs liquidity changes listener initialized');

    this.soraAPI.rpc.chain.subscribeNewHeads(async (header) => {
      const blockHash = await this.soraAPI.rpc.chain.getBlockHash(
        header.number,
      );
      const block = await this.soraAPI.rpc.chain.getBlock(blockHash);
      const timestamp = await this.soraAPI.query.timestamp.now();

      const specificAPI = await this.soraAPI.at(blockHash);
      const records = await specificAPI.query.system.events();

      block.block.extrinsics.forEach(
        ({ method: { method, section, args } }, index) => {
          records
            .filter(
              ({ phase }) =>
                phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index),
            )
            .forEach(({ event }) => {
              if (this.soraAPI.events.system.ExtrinsicSuccess.is(event)) {
                if (section === 'poolXYK') {
                  args = JSON.parse(JSON.stringify(args));

                  if (method === 'depositLiquidity') {
                    const parsedArgs = parsePoolXYKDepositArgs(args);
                    console.log(parsedArgs);
                  }

                  if (method === 'withdrawLiquidity') {
                    const parsedArgs = parsePoolXYKWithdrawArgs(args);
                    console.log(parsedArgs);
                  }
                }
              }
            });
        },
      );
    });
  }
}
