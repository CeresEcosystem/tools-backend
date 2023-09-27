import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { ApiPromise } from '@polkadot/api/promise';
import { WsProvider } from '@polkadot/rpc-provider';
import { FPNumber } from '@sora-substrate/math';
import { PROVIDER } from 'src/constants/constants';
import { Swap } from './entity/swaps.entity';
import { SwapGateway } from './swaps.gateway';
import { SwapDto } from './dto/swap.dto';

@Injectable()
export class SwapListener {
  private soraApi;
  private readonly logger = new Logger('TokenSwap');

  constructor(
    @InjectRepository(Swap)
    private readonly swapRepository: Repository<Swap>,
    private swapGateway: SwapGateway,
  ) {
    const provider = new WsProvider(PROVIDER);
    this.soraApi = new ApiPromise({ provider, noInitWarn: true });
  }

  async trackSwaps() {
    await this.soraApi.isReady;
    this.soraApi.query.system.events(async (events) => {
      for (const record of events) {
        const { event } = record;

        if (event?.section != 'liquidityProxy' && event?.method != 'Exchange')
          continue;

        this.logger.log('Start fetching token swaps.');
        const swap = new Swap();
        const eventData = event.data.toHuman();
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
        try {
          await this.swapRepository.save(swap);
          const swapDto: SwapDto = {
            swappedAt: swap.swappedAt,
            accountId: swap.accountId,
            inputAssetId: swap.inputAssetId,
            outputAssetId: swap.outputAssetId,
            assetInputAmount: swap.assetInputAmount,
            assetOutputAmount: swap.assetOutputAmount,
          };
          this.swapGateway.onSwap(swapDto);
          this.logger.log('Fetching token swaps was successful.');
        } catch (error) {
          if (error instanceof QueryFailedError) {
            const driverError = error.driverError;
            console.log(driverError);
          } else {
            console.error('An error occurred: ', error.message);
            throw error;
          }
        }
      }
    });
  }
}
