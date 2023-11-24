import { Injectable, Logger } from '@nestjs/common';
import { TransfersRepository } from './transfers.repository';
import { Transfer } from './entity/transfer.entity';
import { SoraClient } from '../sora-client/sora-client';
import { FPNumber } from '@sora-substrate/math';

@Injectable()
export class TransfersListener {
  private readonly logger = new Logger(TransfersListener.name);

  constructor(
    private readonly transferRepo: TransfersRepository,
    private readonly soraClient: SoraClient,
  ) {
    this.trackTransfers();
  }

  private async trackTransfers(): Promise<void> {
    const soraApi = await this.soraClient.getSoraApi();

    soraApi.query.system.events(async (events) => {
      for (const record of events) {
        const { block } = await soraApi.rpc.chain.getBlock();
        const blockNum = block.header.toHuman().number;
        const blockNumStr = blockNum.toString().replaceAll(',', '');

        const { event } = record;

        if (event?.section !== 'assets' && event?.method !== 'transfer') {
          continue;
        }

        const transfer = new Transfer();
        const eventData = event.data.toHuman();
        const [senderAccountId, receiverAccountId, { code: AssetId }, amount] =
          eventData;

        if (
          senderAccountId.startsWith('cnTQ') ||
          receiverAccountId.startsWith('cnTQ')
        ) {
          continue;
        }

        this.logger.debug('Start storing transfers.');

        transfer.senderAccountId = senderAccountId;
        transfer.asset = AssetId;
        transfer.amount = FPNumber.fromCodecValue(amount).toNumber();
        transfer.receiverAccountId = receiverAccountId;
        transfer.transferredAt = new Date();
        transfer.block = parseInt(blockNumStr);
        await this.transferRepo.saveTransfer(transfer);

        this.logger.debug('Storing transfers was successful.');
      }
    });
  }
}
