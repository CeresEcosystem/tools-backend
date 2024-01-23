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
import * as Sentry from '@sentry/node';

const DENOMINATOR = FPNumber.fromNatural(10 ** 18);

@Injectable()
export class TokenHoldersService {
  private keyring = new Keyring();
  private logger = new Logger(TokenHoldersService.name);

  constructor(
    private readonly soraClient: SoraClient,
    private readonly relevantPricesService: RelevantPricesService,
    private holderRepo: HoldersRepository,
  ) {}

  public async getHoldersAndBalances(
    pageOptions: PageOptionsDto,
    assetId: string,
  ): Promise<PageDto<HolderDto>> {
    const holders = await this.holderRepo.findHoldersAndBalances(
      pageOptions,
      assetId,
    );

    return holders;
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  private async updateHolders(): Promise<void> {
    const transaction = Sentry.startTransaction({
      op: 'updateHolders',
      name: 'Update Holders',
    });

    this.logger.log('Start updating holders balances');
    await this.upsertHolderTokensAndBalances();
    await this.holderRepo.deleteHoldersWithZeroBalance();
    this.logger.log('Updating holders balances successful.');
    transaction.finish();
  }

  private async getTokenHolders(): Promise<Set<string>> {
    this.logger.log('Start getTokenHolders function - get all unique holders');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();
    const allTokens = await this.relevantPricesService.findAllRelevantTokens();
    const allStorageKeysSerialized = await soraApi.rpc.state.getKeys(
      '0x99971b5749ac43e0235e41b0d37869188ee7418a6531173d60d1f6a82d8f4d51',
    );

    const allStorageKeys = allStorageKeysSerialized.toHuman() as string[];

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

          if (!uniqueHolders.has(address)) {
            uniqueHolders.add(address);
          }
        });
    });
    this.logger.log('Iterating storage keys complete - got all unique holders');

    return uniqueHolders;
  }

  private async upsertHolderTokensAndBalances(): Promise<void> {
    this.logger.log('Start upserting token holders and their balances');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();
    const holders = await this.getTokenHolders();

    this.logger.log(
      `Iterate all unique holders and get their portfolios, number of unique holders: ${holders.size}`,
    );

    const holdersAndAssets = await Promise.all(
      Array.from(holders).map(async (holder) => {
        const portfolio = await soraApi.query.tokens.accounts.entries(holder);

        return portfolio.map((portfolioAsset) => {
          const [assetsId, assetAmount] = portfolioAsset;
          const [, { code: assetId }] = assetsId.toHuman();
          const { free: assetBalance } = assetAmount.toHuman();

          return {
            holder,
            assetId,
            balance: new FPNumber(assetBalance).div(DENOMINATOR).toNumber(),
          };
        });
      }),
    );

    this.logger.log(
      'Iteration complete - got all unique holders assets and balances',
    );

    this.logger.log(
      `Map an array that holds all holderEntities. Holders and assets array size: ${
        holdersAndAssets.flat().length
      }`,
    );
    const holderEntities = holdersAndAssets.flat().map((value) => {
      const holderEntity = new Holder();
      holderEntity.holder = value.holder;
      holderEntity.assetId = value.assetId;
      holderEntity.balance = value.balance;

      return holderEntity;
    });
    this.logger.log('Array that holds holderEntities created');

    this.logger.log('upsert DB');
    await this.holderRepo.upsertHolders(holderEntities);
    this.logger.log('DB upserted');
  }
}
