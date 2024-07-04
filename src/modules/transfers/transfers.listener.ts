/* eslint-disable init-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { TransfersRepository } from './transfers.repository';
import { Transfer, TransferDirection } from './entity/transfer.entity';
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
import { convertAddress } from 'src/utils/address-convertor.helper';

interface TransferData {
  type: string;
  senderAccountId: string;
  receiverAccountId: string;
  asset: string;
  amount: string | number;
  block: string | number;
  direction?: TransferDirection;
}

@Injectable()
export class TransfersListener {
  private readonly logger = new Logger(TransfersListener.name);
  private readonly keyring = new Keyring({ type: 'ecdsa' });

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
    this.trackBrigdeTransfersFromSoraToEthereum(soraApi);
    this.trackBrigdeTransfersFromEthereum();
  }

  private isAssetsEvent(event: any): boolean {
    return event?.section === 'assets' && event?.method === 'Transfer';
  }

  private isParachainBridgeEvent(event: any): boolean {
    return (
      event?.section === 'parachainBridgeApp' &&
      (event?.method === 'Burned' || event?.method === 'Minted')
    );
  }

  private isSubstrateBridgeEvent(event: any): boolean {
    return (
      event?.section === 'substrateBridgeApp' &&
      (event?.method === 'Burned' || event?.method === 'Minted')
    );
  }

  private trackTransfers(soraApi: any): void {
    soraApi.query.system.events(async (events) => {
      const { block } = await soraApi.rpc.chain.getBlock();
      const blockNum = block.header.toHuman().number;
      const blockNumStr = blockNum.toString().replaceAll(',', '');

      for (const record of events) {
        const { event } = record;

        const eventData = event.data.toHuman();

        if (this.isAssetsEvent(event)) {
          this.saveSoraTransfer(eventData, blockNumStr);
        } else if (this.isParachainBridgeEvent(event)) {
          this.saveParachainBridgeTransfer(
            eventData,
            blockNumStr,
            event?.method === 'Burned',
          );
        } else if (this.isSubstrateBridgeEvent(event)) {
          this.saveSubstrateBridgeTransfer(
            eventData,
            blockNumStr,
            event?.method === 'Burned',
          );
        }
      }
    });
  }

  private async saveTransfer(transferData: TransferData): Promise<void> {
    this.logger.debug('Start storing transfer.');

    const transfer = new Transfer();

    transfer.senderAccountId = transferData.senderAccountId;
    transfer.asset = transferData.asset;
    transfer.amount =
      typeof transferData.amount === 'number'
        ? transferData.amount
        : FPNumber.fromCodecValue(transferData.amount).toNumber();
    transfer.receiverAccountId = transferData.receiverAccountId;
    transfer.transferredAt = new Date();
    transfer.block =
      typeof transferData.block === 'number'
        ? transferData.block
        : parseInt(transferData.block);
    transfer.type = transferData.type;
    transfer.direction = transferData.direction;

    await this.transferRepo.saveTransfer(transfer);

    this.logger.debug('Storing transfer was successful.');
  }

  private async saveSoraTransfer(
    eventData: any,
    blockNumStr: string,
  ): Promise<void> {
    const [senderAccountId, receiverAccountId, { code: assetId }, amount] =
      eventData;

    if (
      senderAccountId.startsWith('cnTQ') ||
      receiverAccountId.startsWith('cnTQ')
    ) {
      return;
    }

    await this.saveTransfer({
      type: 'Sora',
      senderAccountId,
      receiverAccountId,
      asset: assetId,
      amount,
      block: blockNumStr,
    });
  }

  private async saveParachainBridgeTransfer(
    eventData: any,
    blockNumStr: string,
    burned: boolean,
  ): Promise<void> {
    let transferData;
    let senderAccountId;
    let receiverAccountId;

    if (burned) {
      const [type, { code: assetId }, accountId, , amount] = eventData;
      transferData = { type, assetId, amount };
      senderAccountId = accountId;
      receiverAccountId = convertAddress(
        this.keyring,
        type,
        accountId,
        assetId,
      );
    } else {
      const [type, { code: assetId }, , accountId, amount] = eventData;
      transferData = { type, assetId, amount };
      receiverAccountId = accountId;
      senderAccountId = convertAddress(this.keyring, type, accountId, assetId);
    }

    await this.saveTransfer({
      type: transferData.type,
      senderAccountId,
      receiverAccountId,
      asset: transferData.assetId,
      amount: transferData.amount,
      block: blockNumStr,
      direction: burned ? TransferDirection.BURNED : TransferDirection.MINTED,
    });
  }

  private async saveSubstrateBridgeTransfer(
    eventData: any,
    blockNumStr: string,
    burned: boolean,
  ): Promise<void> {
    let transferData;
    let senderAccountId;
    let receiverAccountId;

    if (burned) {
      const { networkId, assetId, sender, amount } = eventData;
      transferData = {
        type: networkId,
        assetId: assetId.code,
        amount,
      };
      senderAccountId = sender;
      receiverAccountId = convertAddress(
        this.keyring,
        networkId,
        sender,
        assetId,
      );
    } else {
      const { networkId, assetId, recipient, amount } = eventData;
      transferData = {
        type: networkId,
        assetId: assetId.code,
        amount,
      };
      receiverAccountId = recipient;
      senderAccountId = convertAddress(
        this.keyring,
        networkId,
        recipient,
        assetId,
      );
    }

    await this.saveTransfer({
      type: transferData.type,
      senderAccountId,
      receiverAccountId,
      asset: transferData.assetId,
      amount: transferData.amount,
      block: blockNumStr,
      direction: burned ? TransferDirection.BURNED : TransferDirection.MINTED,
    });
  }

  private trackBrigdeTransfersFromSoraToEthereum(soraApi: any): void {
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
              await this.saveTransfer({
                type: 'ETH',
                senderAccountId: signer.toHuman(),
                receiverAccountId: args[1].toString(),
                asset: args[0]?.code?.toHuman(),
                amount: args[2],
                block: header.number.toNumber(),
                direction: TransferDirection.BURNED,
              });
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

      await this.saveTransfer({
        type: 'ETH',
        senderAccountId: tx.from,
        receiverAccountId: convertAddress(this.keyring, 'ETH', destination),
        asset,
        amount: Number(ethers.utils.formatUnits(amount, decimals)),
        block,
        direction: TransferDirection.MINTED,
      });
    });
  }
}
