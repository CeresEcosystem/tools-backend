import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KensetsuBurn } from './entity/kensetsu-burn.entity';
import { Repository } from 'typeorm';
import { SoraClient } from '../sora-client/sora-client';
import { XOR_ADDRESS } from 'src/constants/constants';
import { FPNumber } from '@sora-substrate/math';

@Injectable()
export class KensetsuListener {
  private readonly logger = new Logger(KensetsuListener.name);

  constructor(
    @InjectRepository(KensetsuBurn)
    private readonly kensetsuRepo: Repository<KensetsuBurn>,
    private readonly soraClient: SoraClient,
  ) {
    this.trackBurns();
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

        const kensetsuBurn = {
          accountId,
          assetId,
          amountBurned: FPNumber.fromCodecValue(amount).toNumber(),
          createdAt: new Date(),
          blockNum: blockNumStr,
        } as KensetsuBurn;

        this.kensetsuRepo.insert(kensetsuBurn);

        this.logger.log('Asset burn event received.');
      }

      this.logger.debug('Kensetsu burn events processed.');
    });
  }
}
