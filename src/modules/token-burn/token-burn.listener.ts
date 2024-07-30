import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenBurn } from './entity/token-burn.entity';
import { Repository } from 'typeorm';
import { IS_WORKER_INSTANCE, XOR_ADDRESS } from 'src/constants/constants';
import { FPNumber } from '@sora-substrate/math';
import { SoraClient } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class TokenBurnListener {
  private readonly logger = new Logger(TokenBurnListener.name);

  constructor(
    @InjectRepository(TokenBurn)
    private readonly tokenBurnRepo: Repository<TokenBurn>,
    private readonly soraClient: SoraClient,
  ) {
    if (IS_WORKER_INSTANCE) {
      this.trackBurns();
    }
  }

  private async trackBurns(): Promise<void> {
    const soraApi = await this.soraClient.getSoraApi();

    soraApi.query.system.events(async (events) => {
      this.logger.debug(`Events received, count: ${events.length}.`);

      const { block } = await soraApi.rpc.chain.getBlock();
      const blockNum = block.header.toHuman().number;
      const blockNumStr = blockNum.toString().replaceAll(',', '');

      for (const record of events) {
        const { event } = record;

        if (event?.section !== 'assets' || event?.method !== 'Burn') {
          continue;
        }

        const eventData = event.data.toHuman();
        const [accountId, { code: assetId }, amount] = eventData;

        if (assetId !== XOR_ADDRESS) {
          continue;
        }

        this.logger.log('XOR burn event received.');

        const tokenBurn = {
          accountId,
          assetId,
          amountBurned: FPNumber.fromCodecValue(amount).toNumber(),
          createdAt: new Date(),
          blockNum: blockNumStr,
        } as TokenBurn;

        this.tokenBurnRepo.insert(tokenBurn);

        this.logger.log('Asset burn event received.');
      }

      this.logger.debug('Token burn events processed.');
    });
  }
}
