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
import {
  SoraClient,
  SoraEventListener,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { convertAddress } from 'src/utils/address-convertor.helper';
import { QueryFailedError } from 'typeorm';
import { IS_WORKER_INSTANCE } from 'src/constants/constants';

const ASSETS_TRANSFER_SECTION = 'assets';
const PARACHAIN_TRANSFER_SECTION = 'parachainBridgeApp';
const SUBSTRATE_TRANSFER_SECTION = 'substrateBridgeApp';

type TransferEvent = [string, string, { code: string }, string];
type TransferParachainBurnedEvent = [
  string,
  { code: string },
  string,
  unknown,
  string,
];
type TransferParachainMintedEvent = [
  string,
  { code: string },
  unknown,
  string,
  string,
];

interface TransferSubstrateBurnedEvent {
  networkId: string;
  assetId: { code: string };
  sender: string;
  amount: string;
}

interface TransferSubstrateMintedEvent {
  networkId: string;
  assetId: { code: string };
  recipient: string;
  amount: string;
}

interface TransferData {
  type: string;
  senderAccountId: string;
  receiverAccountId: string;
  asset: string;
  amount: string | number;
  block: string | number;
  direction?: TransferDirection;
}

enum TRANSFER_METHODS {
  Burned = 'Burned',
  Minted = 'Minted',
  Transfer = 'Transfer',
}

@Injectable()
export class TransfersListener {
  private readonly logger = new Logger(TransfersListener.name);
  private readonly keyring = new Keyring({ type: 'ecdsa' });

  constructor(
    private readonly transferRepo: TransfersRepository,
    private readonly soraClient: SoraClient,
    private readonly soraEventListener: SoraEventListener,
    private readonly tokenPriceService: TokenPriceService,
  ) {
    if (IS_WORKER_INSTANCE) {
      this.runListeners();

      this.soraEventListener.subscribe(
        ASSETS_TRANSFER_SECTION,
        this.processAssetsTransferEvent.bind(this),
      );
      this.soraEventListener.subscribe(
        PARACHAIN_TRANSFER_SECTION,
        this.processParachainTransferEvent.bind(this),
      );
      this.soraEventListener.subscribe(
        SUBSTRATE_TRANSFER_SECTION,
        this.processSubstrateTransferEvent.bind(this),
      );
    }
  }

  private runListeners(): void {
    this.trackBrigdeTransfersFromSoraToEthereum();
    this.trackBrigdeTransfersFromEthereum();
  }

  private async processAssetsTransferEvent(
    blockNum: string,
    method: string,
    data: unknown,
  ): Promise<void> {
    this.logger.debug(`Asset transfer event received '${method}'.`, data);

    try {
      if (method === TRANSFER_METHODS.Transfer) {
        await this.saveSoraTransfer(data as TransferEvent, blockNum);
      }
    } catch (exception) {
      this.logErrorMessage(exception, 'assets');
    }
  }

  private async saveSoraTransfer(
    eventData: TransferEvent,
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

  private async processParachainTransferEvent(
    blockNum: string,
    method: string,
    data: unknown,
  ): Promise<void> {
    this.logger.debug(`Parachain transfer event received '${method}'.`, data);

    try {
      if (method === TRANSFER_METHODS.Burned) {
        await this.saveParachainTransferBurnedEvent(
          data as TransferParachainBurnedEvent,
          blockNum,
        );
      } else if (method === TRANSFER_METHODS.Minted) {
        await this.saveParachainTransferMintedEvent(
          data as TransferParachainMintedEvent,
          blockNum,
        );
      }
    } catch (exception) {
      this.logErrorMessage(exception, 'parachain');
    }
  }

  private async saveParachainTransferBurnedEvent(
    eventData: TransferParachainBurnedEvent,
    blockNumStr: string,
  ): Promise<void> {
    const [type, { code: assetId }, accountId, , amount] = eventData;

    const receiverAccountId = convertAddress(
      this.keyring,
      type,
      accountId,
      assetId,
    );

    await this.saveTransfer({
      type,
      senderAccountId: accountId,
      receiverAccountId,
      asset: assetId,
      amount,
      block: blockNumStr,
      direction: TransferDirection.BURNED,
    });
  }

  private async saveParachainTransferMintedEvent(
    eventData: TransferParachainMintedEvent,
    blockNumStr: string,
  ): Promise<void> {
    const [type, { code: assetId }, , accountId, amount] = eventData;

    const senderAccountId = convertAddress(
      this.keyring,
      type,
      accountId,
      assetId,
    );

    await this.saveTransfer({
      type,
      senderAccountId,
      receiverAccountId: accountId,
      asset: assetId,
      amount,
      block: blockNumStr,
      direction: TransferDirection.MINTED,
    });
  }

  private async processSubstrateTransferEvent(
    blockNum: string,
    method: string,
    data: unknown,
  ): Promise<void> {
    this.logger.debug(`Substrate transfer event received '${method}'.`, data);

    try {
      if (method === TRANSFER_METHODS.Burned) {
        await this.saveSubstrateTransferBurnedEvent(
          data as TransferSubstrateBurnedEvent,
          blockNum,
        );
      } else if (method === TRANSFER_METHODS.Minted) {
        this.saveSubstrateTransferMintedEvent(
          data as TransferSubstrateMintedEvent,
          blockNum,
        );
      }
    } catch (exception) {
      this.logErrorMessage(exception, 'substrate');
    }
  }

  private async saveSubstrateTransferBurnedEvent(
    eventData: TransferSubstrateBurnedEvent,
    blockNumStr: string,
  ): Promise<void> {
    const { networkId, assetId, sender, amount } = eventData;

    const receiverAccountId = convertAddress(
      this.keyring,
      networkId,
      sender,
      assetId.code,
    );

    await this.saveTransfer({
      type: networkId,
      senderAccountId: sender,
      receiverAccountId,
      asset: assetId.code,
      amount,
      block: blockNumStr,
      direction: TransferDirection.BURNED,
    });
  }

  private async saveSubstrateTransferMintedEvent(
    eventData: TransferSubstrateMintedEvent,
    blockNumStr: string,
  ): Promise<void> {
    const { networkId, assetId, recipient, amount } = eventData;

    const senderAccountId = convertAddress(
      this.keyring,
      networkId,
      recipient,
      assetId.code,
    );

    await this.saveTransfer({
      type: networkId,
      senderAccountId,
      receiverAccountId: recipient,
      asset: assetId.code,
      amount,
      block: blockNumStr,
      direction: TransferDirection.MINTED,
    });
  }

  private async trackBrigdeTransfersFromSoraToEthereum(): Promise<void> {
    const soraApi: any = await this.soraClient.getSoraApi();

    soraApi.rpc.chain.subscribeNewHeads(async (header) => {
      const blockHash = await soraApi.rpc.chain.getBlockHash(header.number);
      const { block } = await soraApi.rpc.chain.getBlock(blockHash);
      const specificAPI = await soraApi.at(blockHash);
      const records = await specificAPI.query.system.events();

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

    ethContract.on('Deposit', async (destination, amount, token, _, event) => {
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

  private async saveTransfer(transferData: TransferData): Promise<void> {
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
  }

  private logErrorMessage(exception: unknown, type: string): void {
    if (exception instanceof QueryFailedError) {
      this.logger.error(exception.message, exception.stack, exception.cause);
    } else {
      this.logger.error(
        `An error happened during ${type} transfer event processing`,
        exception,
      );
    }
  }
}
