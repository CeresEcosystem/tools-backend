/* eslint-disable no-await-in-loop */
import { Injectable, Logger } from '@nestjs/common';
import { Keyring } from '@polkadot/api';
import { FPNumber } from '@sora-substrate/math';
import { RelevantPricesService } from '../notification-relevant-prices/relevant-prices.service';
import { HoldersRepository } from './holders.repository';
import { Holder } from './entity/holders.entity';
import { HolderDto } from './dto/holder.dto';
import { CronExpression, Cron } from '@nestjs/schedule';
import { RelevantPrices } from '../notification-relevant-prices/entity/relevant-prices.entity';
import {
  PageDto,
  PageOptionsDto,
  SoraClient,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

const KEY =
  '0x99971b5749ac43e0235e41b0d37869188ee7418a6531173d60d1f6a82d8f4d51';
const STORAGE_KEYS_PAGE_SIZE = 500;

@Injectable()
export class TokenHoldersService {
  private keyring = new Keyring();
  private logger = new Logger(TokenHoldersService.name);

  constructor(
    private readonly soraClient: SoraClient,
    private readonly relevantPricesService: RelevantPricesService,
    private readonly holderRepo: HoldersRepository,
  ) {}

  public getHoldersAndBalances(
    pageOptions: PageOptionsDto,
    assetId: string,
  ): Promise<PageDto<HolderDto>> {
    return this.holderRepo.findHoldersAndBalances(pageOptions, assetId);
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  private async upsertHolderTokensAndBalances(): Promise<void> {
    this.logger.log('Start updating holders balances.');

    const updateTime = new Date();
    const allTokens = await this.relevantPricesService.findAllRelevantTokens();

    let storageKeysPage = [];
    let lastKey = null;
    let pageCount = 0;

    do {
      pageCount += 1;
      this.logger.log(`Processing storage keys page ${pageCount}`);

      storageKeysPage = await this.getStorageKeysPage(lastKey);
      lastKey = storageKeysPage.at(-1);
      await this.updateHolderAssets(allTokens, storageKeysPage);

      await this.wait(1);
    } while (storageKeysPage.length === STORAGE_KEYS_PAGE_SIZE);

    await this.holderRepo.deleteHoldersUpdatedBefore(updateTime);

    this.logger.log('Updating holders balances successful.');
  }

  private async updateHolderAssets(
    allTokens: RelevantPrices[],
    storageKeysPage: string[],
  ): Promise<void> {
    const holders = this.getTokenHolders(allTokens, storageKeysPage);
    const soraApi = await this.soraClient.getSoraApi();

    this.logger.log(`Updating balances for ${holders.size} holders.`);

    const holderAssets = (
      await Promise.all(
        Array.from(holders).map(async (holder) => {
          const portfolio = await soraApi.query.tokens.accounts.entries(holder);

          return portfolio
            .map((portfolioAsset): Holder => {
              const [assetsId, assetAmount] = portfolioAsset;
              const [, { code: assetId }] = assetsId.toHuman() as [
                string,
                { code: string },
              ];
              const { free: assetBalance } = assetAmount.toHuman() as {
                free: number;
              };

              return {
                holder,
                assetId,
                balance: FPNumber.fromCodecValue(assetBalance).toNumber(),
                updatedAt: new Date(),
              } as Holder;
            })
            .filter((holder) => holder.balance > 0);
        }),
      )
    ).flat();

    this.logger.log(`Updating ${holderAssets.length} holder assets.`);

    await this.holderRepo.upsertHolders(holderAssets);
  }

  private async getStorageKeysPage(startAt?: string): Promise<string[]> {
    const soraApi = await this.soraClient.getSoraApi();

    const storageKeys = startAt
      ? soraApi.rpc.state.getKeysPaged(KEY, STORAGE_KEYS_PAGE_SIZE, startAt)
      : soraApi.rpc.state.getKeysPaged(KEY, STORAGE_KEYS_PAGE_SIZE);

    return (await storageKeys).toHuman() as string[];
  }

  private getTokenHolders(
    allTokens: RelevantPrices[],
    storageKeysPage: string[],
  ): Set<string> {
    const uniqueHolders = new Set<string>();

    allTokens.forEach((token) => {
      storageKeysPage
        .filter((key) => key.includes(token.assetId.slice(2)))
        .forEach((key) => {
          const address = this.keyring.encodeAddress(
            `0x${key.substring(98, 162)}`,
            69,
          );

          uniqueHolders.add(address);
        });
    });

    return uniqueHolders;
  }

  private async wait(seconds: number): Promise<void> {
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}
