import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiPromise } from '@polkadot/api/promise';
import { WsProvider } from '@polkadot/rpc-provider';
import { options } from '@sora-substrate/api';
import { PROVIDER } from '../../constants/constants';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { TokenPriceBcDto } from './dto/token-price-bc.dto';
import { TokenPriceService } from './token-price.service';
import * as whitelist from 'src/utils/files/whitelist.json';
import { FPNumber } from '@sora-substrate/math';

const DAI_ADDRESS =
  '0x0200060000000000000000000000000000000000000000000000000000000000';
const HUNDREDS = ['HOT', 'UMI', 'SOSHIBA'];
const BILLIONS = ['MEOW'];

@Injectable()
export class TokenPriceSync {
  private readonly logger = new Logger(TokenPriceSync.name);
  private soraApi;
  private tokens: TokenPriceBcDto[] = [];

  constructor(private readonly tokenPriceService: TokenPriceService) {
    const provider = new WsProvider(PROVIDER);
    new ApiPromise(options({ provider, noInitWarn: true })).isReady.then(
      (api) => {
        this.soraApi = api;
        this.getTokens().then();
      },
    );
  }

  async getTokens(): Promise<void> {
    const tokens = await this.soraApi.query.assets.assetInfos.entries();

    for (let [assetId, token] of tokens) {
      assetId = assetId.toHuman()[0].code;

      if (!whitelist.includes(assetId)) {
        continue;
      }

      token = token.toHuman();
      const assetSymbol = token[0];
      const fullName = token[1] + ' (' + assetSymbol + ')';

      this.tokens.push({
        symbol: assetSymbol,
        assetId,
        fullName,
      } as TokenPriceBcDto);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async fetchTokenPrices(): Promise<void> {
    this.logger.log('Start fetching tokens prices.');
    const pricesToUpsert: TokenPriceBcDto[] = [];

    for (const token of this.tokens) {
      const symbol = token.symbol;
      let amount = 1;

      if (HUNDREDS.includes(symbol)) {
        amount = 100;
      } else if (BILLIONS.includes(symbol)) {
        amount = 1000000000;
      }

      await this.soraApi.rpc.liquidityProxy.quote(
        0,
        token.assetId,
        DAI_ADDRESS,
        FPNumber.fromNatural(amount).bnToString(),
        'WithDesiredInput',
        ['XYKPool'],
        'Disabled',
        (result) => {
          const value = !result.isNone
            ? result.unwrap()
            : { amount: 0, fee: 0, rewards: [], amountWithoutImpact: 0 };

          let price: any = new FPNumber(value.amount).toNumber();
          price = HUNDREDS.includes(symbol) ? (price / 100).toFixed(8) : price;
          price = BILLIONS.includes(symbol)
            ? (price / 1000000000).toFixed(12)
            : price;

          pricesToUpsert.push({
            ...token,
            price: symbol === 'DAI' ? '1' : price.toString(),
          });
        },
      );
    }

    if (pricesToUpsert.length > 0) {
      this.tokenPriceService.save(pricesToUpsert);
    }

    this.logger.log('Fetching of tokens prices was successful!');
  }
}