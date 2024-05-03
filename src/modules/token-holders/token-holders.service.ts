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

@Injectable()
export class TokenHoldersService {
  private keyring = new Keyring();
  private logger = new Logger(TokenHoldersService.name);

  constructor(
    private readonly soraClient: SoraClient,
    private readonly relevantPricesService: RelevantPricesService,
    private holderRepo: HoldersRepository,
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

    const holders = await this.getTokenHolders();

    this.logger.log(
      `Iterate all unique holders and get their portfolios, number of unique holders: ${holders.size}`,
    );

    await this.updateHolderAssets(holders);

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
    const allStorageKeys = [];

    let batchedStorageKeysHuman = (
      await soraApi.rpc.state.getKeysPaged(
        '0x99971b5749ac43e0235e41b0d37869188ee7418a6531173d60d1f6a82d8f4d51',
        1000,
      )
    ).toHuman() as string[];
    allStorageKeys.push(batchedStorageKeysHuman);

    while (batchedStorageKeysHuman.length > 0) {
      const startAt =
        batchedStorageKeysHuman[batchedStorageKeysHuman.length - 1];

      batchedStorageKeysHuman = (
        await soraApi.rpc.state.getKeysPaged(
          '0x99971b5749ac43e0235e41b0d37869188ee7418a6531173d60d1f6a82d8f4d51',
          1000,
          startAt,
        )
      ).toHuman() as string[];

      allStorageKeys.push(...batchedStorageKeysHuman);
    }

    return allStorageKeys;
  }

  private async updateHolderAssets(holders: Set<string>): Promise<void> {
    const soraApi = await this.soraClient.getSoraApi();

    this.logger.log('Updating holders balances.');

    Array.from(holders).forEach((holder) => {
      setImmediate(async () => {
        const portfolio = await soraApi.query.tokens.accounts.entries(holder);

        portfolio.map(async (portfolioAsset) => {
          const [assetsId, assetAmount] = portfolioAsset;
          const [, { code: assetId }] = assetsId.toHuman() as [
            string,
            { code: string },
          ];
          const { free: assetBalance } = assetAmount.toHuman() as {
            free: number;
          };

          const holderEntity = new Holder();
          holderEntity.holder = holder;
          holderEntity.assetId = assetId;
          holderEntity.balance =
            FPNumber.fromCodecValue(assetBalance).toNumber();
          holderEntity.updatedAt = new Date();

          await this.holderRepo.upsertHolders([holderEntity]);
        });
      });
    });
  }
}
