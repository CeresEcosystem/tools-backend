/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { TransfersRepository } from './transfers.repository';
import { Transfer } from './entity/transfer.entity';
import { FPNumber } from '@sora-substrate/math';
import { ethers } from 'ethers';
import {
  EVENT_DEFAULT_ADDRESS,
  ETH_RPC_URL,
  ETH_SORA_ADDRESS,
  HASHI_BRIDGE_ADDRESS,
} from './transfers.constants';
import * as hashiBridgeABI from '../../utils/files/hashi-bridge-abi.json';
import * as tokenSymbolABI from '../../utils/files/token-symbol-abi.json';
import { Keyring } from '@polkadot/api';
import { TokenPriceService } from '../token-price/token-price.service';
import { SoraClient } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Injectable()
export class TransfersListener {
  private readonly logger = new Logger(TransfersListener.name);

  constructor(
    private readonly transferRepo: TransfersRepository,
    private readonly soraClient: SoraClient,
    private readonly tokenPriceService: TokenPriceService,
  ) {
    this.runListeners();
  }

  private async runListeners(): Promise<void> {
    const soraApi: any = await this.soraClient.getSoraApi();
    this.trackTransfers(soraApi);
    this.trackBrigdeTransfersFromSora(soraApi);
    this.trackBrigdeTransfersFromEthereum();
  }

  private trackTransfers(soraApi: any): void {
    soraApi.query.system.events(async (events) => {
      const { block } = await soraApi.rpc.chain.getBlock();
      const blockNum = block.header.toHuman().number;
      const blockNumStr = blockNum.toString().replaceAll(',', '');

      for (const record of events) {
        const { event } = record;

        if (event?.section !== 'assets' || event?.method !== 'Transfer') {
          continue;
        }

        const eventData = event.data.toHuman();
        const [senderAccountId, receiverAccountId, { code: assetId }, amount] =
          eventData;

        if (
          senderAccountId.startsWith('cnTQ') ||
          receiverAccountId.startsWith('cnTQ')
        ) {
          continue;
        }

        this.logger.debug('Start storing transfers.');

        const transfer = new Transfer();
        transfer.senderAccountId = senderAccountId;
        transfer.asset = assetId;
        transfer.amount = FPNumber.fromCodecValue(amount).toNumber();
        transfer.receiverAccountId = receiverAccountId;
        transfer.transferredAt = new Date();
        transfer.block = parseInt(blockNumStr);
        await this.transferRepo.saveTransfer(transfer);

        this.logger.debug('Storing transfers was successful.');
      }
    });
  }

  private trackBrigdeTransfersFromSora(soraApi: any): void {
    soraApi.rpc.chain.subscribeNewHeads(async (header) => {
      const blockHash = await soraApi.rpc.chain.getBlockHash(header.number);
      const { block } = await soraApi.rpc.chain.getBlock(blockHash);
      const specificAPI = await soraApi.at(blockHash);
      const records = await specificAPI.query.system.events();

      this.logger.debug(
        `Checking for any bridge transfers from SORA changes at block #${header.number.toNumber()}`,
      );

      block.extrinsics.forEach(
        ({ signer, method: { method, section, args } }, index) => {
          records
            .filter(
              ({ phase }) =>
                phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index),
            )
            .filter(({ event }) =>
              soraApi.events.system.ExtrinsicSuccess.is(event),
            )
            .filter(
              () => section === 'ethBridge' && method === 'transferToSidechain',
            )
            .forEach(async () => {
              this.logger.debug('Start storing bridge transfers from SORA.');

              const transfer = new Transfer();

              transfer.senderAccountId = signer.toHuman();
              transfer.asset = args[0]?.code?.toHuman();
              transfer.amount = FPNumber.fromCodecValue(args[2]).toNumber();
              transfer.receiverAccountId = args[1].toString();
              transfer.transferredAt = new Date();
              transfer.block = header.number.toNumber();

              await this.transferRepo.saveTransfer(transfer);

              this.logger.debug('Storing transfers was successful.');
            });
        },
      );
    });
  }

  private trackBrigdeTransfersFromEthereum(): void {
    const ethProvider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL);
    const ethContract = new ethers.Contract(
      HASHI_BRIDGE_ADDRESS,
      hashiBridgeABI,
      ethProvider,
    );
    const keyring = new Keyring({ type: 'ecdsa' });

    this.logger.debug('Checking for any bridge transfers from Ethereum');

    ethContract.on('Deposit', async (destination, amount, token, _, event) => {
      this.logger.debug('Start storing bridge transfers from Ethereum.');

      const tx = await ethProvider.getTransaction(event.transactionHash);

      const block = await ethProvider.getBlockNumber();
      let asset = ETH_SORA_ADDRESS;
      let decimals = 18;

      if (token !== EVENT_DEFAULT_ADDRESS) {
        const tokenContract = new ethers.Contract(
          token,
          tokenSymbolABI,
          ethProvider,
        );
        const symbol = await tokenContract.symbol();
        const { assetId } = await this.tokenPriceService.findByToken(symbol);
        decimals = await tokenContract.decimals();
        asset = assetId;
      }

      const transfer = new Transfer();

      transfer.senderAccountId = tx.from;
      transfer.asset = asset;
      transfer.amount = Number(ethers.utils.formatUnits(amount, decimals));
      transfer.receiverAccountId = keyring.encodeAddress(destination, 69);
      transfer.transferredAt = new Date();
      transfer.block = block;

      await this.transferRepo.saveTransfer(transfer);

      this.logger.debug('Storing transfers was successful.');
    });
  }
}
