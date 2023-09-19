import { Injectable, Logger } from '@nestjs/common';
import { PROVIDER } from 'src/constants/constants';
import { ApiPromise } from '@polkadot/api/promise';
import { WsProvider } from '@polkadot/rpc-provider';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Swap } from './entity/swaps.entity';
import { FPNumber } from '@sora-substrate/math';

@Injectable()
export class SwapListener {
  private soraApi;
  private readonly logger = new Logger('TokenSwap');
  constructor(
    @InjectRepository(Swap)
    private readonly swapRepository: Repository<Swap>,
  ) {
    const provider = new WsProvider(PROVIDER);
    this.soraApi = new ApiPromise({ provider, noInitWarn: true });
  }

  async startListener() {
    await this.soraApi.isReady;
    this.soraApi.query.system.events(async (events) => {
      console.log('before for loop');
      for (const record of events) {
        console.log('for loop / all events');
        const { event } = record;
        if (
          event?.section === 'liquidityProxy' &&
          event?.method === 'Exchange'
        ) {
          this.logger.log('Start fetching token swaps.');
          const swap = new Swap();
          const eventData = event.data.toHuman();
          console.log(eventData);
          const [
            accountId,
            ,
            { code: inputAssetId },
            { code: outputAssetId },
            assetInputAmount,
            assetOutputAmount,
          ] = eventData;
          swap.accountId = accountId;
          swap.inputAssetId = inputAssetId;
          swap.outputAssetId = outputAssetId;
          swap.assetInputAmount =
            FPNumber.fromCodecValue(assetInputAmount).toNumber();
          swap.assetOutputAmount =
            FPNumber.fromCodecValue(assetOutputAmount).toNumber();
          swap.swappedAt = new Date();
          console.log(swap);
          this.swapRepository.save(swap);
          this.logger.log('Fetching token swaps was successful');
        }
      }
    });
  }

  async findSwapsByInputAssetId(inputAssetId: string) {
    return this.swapRepository.find({
      where: {
        inputAssetId: inputAssetId,
      },
    });
  }
}
