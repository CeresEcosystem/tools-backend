import { Injectable, Logger } from '@nestjs/common';
import { SoraClient } from '../sora-client/sora-client';
import { Keyring } from '@polkadot/api';
import { FPNumber } from '@sora-substrate/math';
import { RelevantPricesService } from '../notification-relevant-prices/relevant-prices.service';
import { HoldersRepository } from './holders.repository';
import { Holder } from './entity/holders.entity';
import { PageDto } from 'src/utils/pagination/page.dto';
import { HolderDto } from './dto/holder.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { CronExpression, Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { HolderAssetDto } from './dto/holder-asset.dto';

const BATCH_SIZE = 'BATCH_SIZE';

@Injectable()
export class TokenHoldersService {
  private keyring = new Keyring();
  private logger = new Logger(TokenHoldersService.name);

  constructor(
    private readonly soraClient: SoraClient,
    private readonly relevantPricesService: RelevantPricesService,
    private holderRepo: HoldersRepository,
    private configs: ConfigService,
  ) {}

  public getHoldersAndBalances(
    pageOptions: PageOptionsDto,
    assetId: string,
  ): Promise<PageDto<HolderDto>> {
    return this.holderRepo.findHoldersAndBalances(pageOptions, assetId);
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  private async upsertHolderTokensAndBalances(): Promise<void> {
    this.logger.log('Start updating holders balances');
    const updateTime = new Date();
    const batchSize = this.configs.get<number>(BATCH_SIZE, 2500);

    const holders = await this.getTokenHolders();

    this.logger.log(
      `Iterate all unique holders and get their portfolios, number of unique holders: ${holders.size}`,
    );

    const holdersAssets = await this.getHolderAssets(holders);

    this.logger.log(
      `Map an array that holds all holderEntities. Holders and assets array size: ${holdersAssets.length}`,
    );

    const holderEntities = holdersAssets.map((value) => {
      const holderEntity = new Holder();
      holderEntity.holder = value.holder;
      holderEntity.assetId = value.assetId;
      holderEntity.balance = value.balance;
      holderEntity.updatedAt = updateTime;

      return holderEntity;
    });

    const holderEntitiesBatches = [];

    for (let i = 0; i < holderEntities.length; i += batchSize) {
      holderEntitiesBatches.push(holderEntities.slice(i, i + batchSize));
    }

    await Promise.all(
      holderEntitiesBatches.map((batch) =>
        this.holderRepo.upsertHolders(batch),
      ),
    );

    await this.holderRepo.deleteHoldersUpdatedBefore(updateTime);

    this.logger.log('Updating holders balances successful.');
  }

  private async getTokenHolders(): Promise<Set<string>> {
    this.logger.log('Start getTokenHolders function - get all unique holders');
    const allTokens = await this.relevantPricesService.findAllRelevantTokens();
    const allStorageKeys = await this.getStorageKeys();

    const uniqueHolders = new Set<string>();

    this.logger.log(
      `Start iterating all storage keys for each token, tokens: ${allTokens.length}, keys: ${allStorageKeys.length}`,
    );

    allTokens.forEach((token) => {
      allStorageKeys
        .filter((key) => key.includes(token.assetId.slice(2)))
        .forEach((key) => {
          const address = this.keyring.encodeAddress(
            `0x${key.substring(98, 162)}`,
            69,
          );

          uniqueHolders.add(address);
        });
    });

    this.logger.log('Iterating storage keys complete - got all unique holders');

    return uniqueHolders;
  }

  private async getStorageKeys(): Promise<string[]> {
    const soraApi = await this.soraClient.getSoraApi();
    const allStorageKeysSerialized = await soraApi.rpc.state.getKeys(
      '0x99971b5749ac43e0235e41b0d37869188ee7418a6531173d60d1f6a82d8f4d51',
    );

    return allStorageKeysSerialized.toHuman() as string[];
  }

  private async getHolderAssets(
    holders: Set<string>,
  ): Promise<HolderAssetDto[]> {
    const soraApi = await this.soraClient.getSoraApi();

    return (
      await Promise.all(
        Array.from(holders).map(async (holder) => {
          await this.waitForRandomTime();
          const portfolio = await soraApi.query.tokens.accounts.entries(holder);

          return portfolio.map((portfolioAsset) => {
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
            };
          });
        }),
      )
    )
      .flat()
      .filter((holder) => holder.balance > 0);
  }

  private async waitForRandomTime(): Promise<void> {
    await new Promise((resolve) =>
      // eslint-disable-next-line no-promise-executor-return
      setTimeout(resolve, Math.floor(Math.random() * 2000) + 100),
    );
  }
}
