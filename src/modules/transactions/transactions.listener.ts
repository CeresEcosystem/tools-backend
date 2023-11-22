import { Injectable, Logger } from '@nestjs/common';
import { TransactionsRepository } from './transactions.repository';
import { Transaction } from './entity/transactions.entity';
import { SoraClient } from '../sora-client/sora-client';
import { FPNumber } from '@sora-substrate/math';

@Injectable()
export class TransactionsListener {
  private readonly logger = new Logger(TransactionsListener.name);

  constructor(
    private readonly txRepo: TransactionsRepository,
    private readonly soraClient: SoraClient,
  ) {
    this.trackTransactions();
  }

  private async trackTransactions(): Promise<void> {
    const soraApi = await this.soraClient.getSoraApi();

    soraApi.query.system.events(async (events) => {
      for (const record of events) {
        const { event } = record;

        if (event?.section !== 'assets' && event?.method !== 'transfer') {
          continue;
        }

        this.logger.log('Start fetching transactions.');
        const transaction = new Transaction();
        const eventData = event.data.toHuman();
        const [senderAccId, receiverAccId, { code: AssetId }, amount] =
          eventData;

        transaction.senderAccId = senderAccId;
        transaction.asset = AssetId;
        transaction.amount = FPNumber.fromCodecValue(amount).toNumber();
        transaction.receiverAccId = receiverAccId;
        await this.txRepo.saveTransaction(transaction);
        this.logger.log('Fetching transactions was successful.');
      }
    });
  }
}
