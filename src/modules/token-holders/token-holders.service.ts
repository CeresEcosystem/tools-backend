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

  private async getTokenHolders(): Promise<string[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();
    const allTokens = await this.relevantPricesService.findAllRelevantTokens();
    const allStorageKeysSerialized = await soraApi.rpc.state.getKeys(
      '0x99971b5749ac43e0235e41b0d37869188ee7418a6531173d60d1f6a82d8f4d51',
    );

    const allStorageKeys = allStorageKeysSerialized.toHuman() as string[];

    const allHolders = allTokens.map((token) => {
      const holders = allStorageKeys
        .filter((key) => key.includes(token.assetId.slice(2)))
        .map((key) => {
          const addresses = this.keyring.encodeAddress(
            `0x${key.substring(98, 162)}`,
            69,
          );

          return addresses;
        });

      return holders;
    });

    const holdersSet = new Set<string>();
    allHolders.flat().forEach((holder) => {
      holdersSet.add(holder);
    });

    return Array.from(holdersSet);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async updateHolderTokensAndBalances(): Promise<void> {
    this.logger.log('Start updating holders balances.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();
    const holders = await this.getTokenHolders();

    await Promise.all(
      holders.map(async (holder) => {
        const portfolio = await soraApi.query.tokens.accounts.entries(holder);

        const relevantPortfolioAssets: {
          token: string;
          balance: number;
        }[] = [
          ...portfolio
            .map((portfolioAsset) => {
              const [assetsId, assetAmount] = portfolioAsset;
              const [, { code: assetId }] = assetsId.toHuman();
              const { free: assetBalance } = assetAmount.toHuman();

              return {
                token: assetId,
                balance: new FPNumber(assetBalance)
                  .div(FPNumber.fromNatural(10 ** 18))
                  .toNumber(),
              };
            })
            .filter(({ balance }) => balance > 0),
        ];

        relevantPortfolioAssets.forEach((asset) => {
          const holderEntity = new Holder();
          holderEntity.holder = holder;
          holderEntity.token = asset.token;
          holderEntity.balance = asset.balance;
          this.holderRepo.upsertHolder(holderEntity);
        });
      }),
    );
    this.logger.log('Updating holders balances successful.');
  }

  public async getHoldersAndBalances(
    pageOptions: PageOptionsDto,
    token: string,
  ): Promise<PageDto<HolderDto>> {
    const holders = await this.holderRepo.findHoldersAndBalances(
      pageOptions,
      token,
    );

    return holders;
  }
}
