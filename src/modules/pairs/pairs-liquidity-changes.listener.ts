import { Injectable, Logger } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { options } from '@sora-substrate/api';
import { PROVIDER } from 'src/constants/constants';
import {
  parsePoolXYKDepositArgs,
  parsePoolXYKWithdrawArgs,
} from './pairs-liquidity-changes.utils';
import { PairLiquidityChangeEntity } from './entity/pair-liquidity-change.entity';
import { PairsLiquidityChangesService } from './pairs-liquidity-changes.service';
import { FPNumber } from '@sora-substrate/math';

@Injectable()
export class PairsLiquidityChangesListener {
  private readonly logger = new Logger(PairsLiquidityChangesListener.name);
  private soraAPI;

  constructor(private readonly service: PairsLiquidityChangesService) {
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

      this.logger.log(
        `Fetching liquidity change data for block #${header.number.toNumber()}`,
      );

      const block = await this.soraAPI.rpc.chain.getBlock(blockHash);
      const timestamp = await this.soraAPI.query.timestamp.now();

      const specificAPI = await this.soraAPI.at(blockHash);
      const records = await specificAPI.query.system.events();

      this.logger.log(
        `Checking for any liquidity changes at block #${header.number.toNumber()}`,
      );

      block.block.extrinsics.forEach(
        ({ signer, method: { method, section, args } }, index) => {
          records
            .filter(
              ({ phase, event }) =>
                phase.isApplyExtrinsic &&
                phase.asApplyExtrinsic.eq(index) &&
                this.soraAPI.events.system.ExtrinsicSuccess.is(event) &&
                section === 'poolXYK',
              method === 'depositLiquidity' || method === 'withdrawLiquidity',
            )
            .forEach(() => {
              if (method === 'depositLiquidity') {
                this.logger.log(
                  `Parsing data for deposit liquidity transaction`,
                );

                const parsedArgs = parsePoolXYKDepositArgs(args);

                const data: PairLiquidityChangeEntity = {
                  signerId: signer.toHuman(),
                  blockNumber: new FPNumber(header.number.toHuman()).toNumber(),
                  firstAssetId: parsedArgs.inputAssetA,
                  firstAssetAmount: parsedArgs.inputADesired,
                  secondAssetId: parsedArgs.inputAssetB,
                  secondAssetAmount: parsedArgs.inputBDesired,
                  timestamp: timestamp.toNumber(),
                  type: method,
                };

                this.logger.log(`Saving liquidity change (deposit) data`);

                this.service.insert(data);
              }

              if (method === 'withdrawLiquidity') {
                this.logger.log(
                  `Parsing data for withdraw liquidity transaction`,
                );

                const parsedArgs = parsePoolXYKWithdrawArgs(args);

                const data: PairLiquidityChangeEntity = {
                  signerId: signer.toHuman(),
                  blockNumber: new FPNumber(header.number.toHuman()).toNumber(),
                  firstAssetId: parsedArgs.outputAssetA,
                  firstAssetAmount: parsedArgs.outputAMin,
                  secondAssetId: parsedArgs.outputAssetB,
                  secondAssetAmount: parsedArgs.outputBMin,
                  timestamp: timestamp.toNumber(),
                  type: method,
                };

                this.logger.log(`Saving liquidity change (withdraw) data`);

                this.service.insert(data);
              }
            });
        },
      );
    });
  }
}
