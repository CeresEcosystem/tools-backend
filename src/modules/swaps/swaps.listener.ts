import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { FPNumber } from '@sora-substrate/math';
import { Swap } from './entity/swaps.entity';
import { SwapGateway } from './swaps.gateway';
import { SwapEntityToDto } from './mapper/swap-entity-to-dto.mapper';
import { SoraClient } from '../sora-client/sora-client';
import * as Sentry from '@sentry/node';

@Injectable()
export class SwapListener {
  private readonly logger = new Logger(SwapListener.name);

  constructor(
    @InjectRepository(Swap)
    private readonly swapRepository: Repository<Swap>,
    private readonly swapGateway: SwapGateway,
    private readonly swapMapper: SwapEntityToDto,
    private readonly soraClient: SoraClient,
  ) {
    this.trackSwaps();
  }

  private async trackSwaps(): Promise<void> {
    const soraApi = await this.soraClient.getSoraApi();

    soraApi.query.system.events(async (events) => {
      const transaction = Sentry.startTransaction({
        op: 'swapListenerEvents',
        name: 'Swap Listener Events',
      });

      this.logger.log(
        `Swap listener events received, count: ${events.length}.`,
      );

      for (const record of events) {
        const { event } = record;

        if (
          event?.section !== 'liquidityProxy' &&
          event?.method !== 'Exchange'
        ) {
          continue;
        }

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
          const swapDto = this.swapMapper.toDto(swap);
          this.swapGateway.onSwap(swapDto);
          this.logger.log(
            `Persisted swap - input asset: ${swapDto.inputAssetId}, output asset: ${swapDto.outputAssetId}.`,
          );
        } catch (error) {
          if (error instanceof QueryFailedError) {
            const { driverError } = error;
            this.logger.log(driverError);
          } else {
            throw error;
          }
        }
      }

      this.logger.log('Swap listener events processed.');

      transaction.finish();
    });
  }
}
