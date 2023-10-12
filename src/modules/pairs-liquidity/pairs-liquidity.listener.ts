import { Injectable, Logger } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { options } from '@sora-substrate/api';
import { PROVIDER } from 'src/constants/constants';
import { PairLiquidityChangeDataDto } from './dto/pair-liquidity-change-data.dto';
import { PairLiquidityChangeDataDtoToEntityMapper } from './mapper/pair-liquidity-change-data-dto-to-entity.mapper';
import { PairsLiquidityService } from './pairs-liquidity.service';

@Injectable()
export class PairsLiquidityListener {
  private readonly logger = new Logger(PairsLiquidityListener.name);
  private soraAPI;

  constructor(
    private readonly service: PairsLiquidityService,
    private readonly mapper: PairLiquidityChangeDataDtoToEntityMapper,
  ) {
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

      this.logger.debug(
        `Fetching event data for block #${header.number.toNumber()}`,
      );

      const block = await this.soraAPI.rpc.chain.getBlock(blockHash);
      const timestamp = await this.soraAPI.query.timestamp.now();

      const specificAPI = await this.soraAPI.at(blockHash);
      const records = await specificAPI.query.system.events();

      this.logger.debug(
        `Checking for any liquidity changes at block #${header.number.toNumber()}`,
      );

      block.block.extrinsics.forEach(
        ({ signer, method: { method, section, args } }, index) => {
          records
            .filter(
              ({ phase }) =>
                phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index),
            )
            .filter(({ event }) =>
              this.soraAPI.events.system.ExtrinsicSuccess.is(event),
            )
            .filter(
              () =>
                section === 'poolXYK' &&
                (method === 'depositLiquidity' ||
                  method === 'withdrawLiquidity'),
            )
            .forEach(async () => {
              const rawData: PairLiquidityChangeDataDto = {
                transactionType: method,
                signerId: signer.toString(),
                blockNumber: header.number.toNumber(),
                timestamp: timestamp.toNumber(),
                eventArgs: args,
              };

              this.logger.debug(
                `Parsing new liquidity change data [block: #${rawData.blockNumber}; transaction type: ${rawData.transactionType}]`,
              );

              const formatedData = this.mapper.toEntity(rawData);

              this.logger.debug(
                `Saving new liquidity change data [block: #${rawData.blockNumber}; transaction type: ${rawData.transactionType}]`,
              );

              await this.service.insert(formatedData);

              this.logger.debug(
                `Saved new liquidity change data [block: #${rawData.blockNumber}; transaction type: ${rawData.transactionType}]`,
              );
            });
        },
      );
    });
  }
}
