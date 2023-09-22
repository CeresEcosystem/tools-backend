import { Injectable, Logger } from '@nestjs/common';
import { Repository, QueryFailedError } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ApiPromise } from '@polkadot/api/promise';
import { WsProvider } from '@polkadot/rpc-provider';
import { FPNumber } from '@sora-substrate/math';

import { PROVIDER } from 'src/constants/constants';

import { Swap } from './entity/swaps.entity';
import { SwapDto } from './dto/swap.do';

import { PageDto } from 'src/utils/pagination/page.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';

@Injectable()
export class SwapRepository {
  private soraApi;
  private readonly logger = new Logger('TokenSwap');
  constructor(
    @InjectRepository(Swap)
    private readonly swapRepository: Repository<Swap>,
  ) {
    const provider = new WsProvider(PROVIDER);
    this.soraApi = new ApiPromise({ provider, noInitWarn: true });
  }

  async writeSwapToDatabase() {
    await this.soraApi.isReady;
    this.soraApi.query.system.events(async (events) => {
      for (const record of events) {
        const { event } = record;
        if (
          event?.section === 'liquidityProxy' &&
          event?.method === 'Exchange'
        ) {
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
          // write data to the database
          swap.accountId = accountId;
          swap.inputAssetId = inputAssetId;
          swap.outputAssetId = outputAssetId;
          swap.assetInputAmount =
            FPNumber.fromCodecValue(assetInputAmount).toNumber();
          swap.assetOutputAmount =
            FPNumber.fromCodecValue(assetOutputAmount).toNumber();
          swap.swappedAt = new Date();
          // Save data to the database
          // Check if there are dobule entries, if true, handle error & continue script
          try {
            this.swapRepository.save(swap);
            this.logger.log('Fetching token swaps was successful');
          } catch (error) {
            console.log(error);
            if (error instanceof QueryFailedError) {
              const driverError = error.driverError;
              console.log(driverError);
            } else {
              console.error('An error occurred:', error.message);
              throw error;
            }
          }
        }
      }
    });
  }

  async findSwapsByAssetId(
    pageOptions: PageOptionsDto,
    assetId: string,
  ): Promise<PageDto<SwapDto>> {
    const [data, count] = await this.swapRepository.findAndCount({
      skip: pageOptions.skip,
      take: pageOptions.size,
      where: [{ inputAssetId: assetId }, { outputAssetId: assetId }],
    });

    const meta = new PageMetaDto(pageOptions.page, pageOptions.size, count);

    return new PageDto(data, meta);
  }
}
