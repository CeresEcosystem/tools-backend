import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiPromise } from '@polkadot/api/promise';
import { WsProvider } from '@polkadot/rpc-provider';
import { options } from '@sora-substrate/api';
import { FPNumber } from '@sora-substrate/math';

import { TokenPriceBcDto } from './dto/token-price-bc.dto';
import { TokenPriceService } from './token-price.service';

import { PROVIDER } from '../../constants/constants';

import * as whitelist from 'src/utils/files/whitelist.json';
import * as synthetics from 'src/utils/files/synthetics.json';

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
      async (api) => {
        this.soraApi = api;
        await this.getTokens();
        await this.fetchTokenPrices();
      },
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async fetchTokenPrices(): Promise<void> {
    this.logger.log('Start fetching tokens prices.');
    const pricesToUpsert: TokenPriceBcDto[] = [];

    for (const token of this.tokens) {
      if (synthetics.includes(token.assetId)) {
        // Get price via band query
        const result = await this.soraApi.query.band.symbolRates(
          token.symbol.substring(3),
        );

        const data = result.toHuman();

        const price = new FPNumber(data.value).div(
          new FPNumber(Math.pow(10, 18)),
        );

        pricesToUpsert.push({ ...token, price: price.toString() });
      } else {
        // Get price via token liquidity

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
            price = HUNDREDS.includes(symbol)
              ? (price / 100).toFixed(8)
              : price;
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
    }

    if (pricesToUpsert.length > 0) {
      this.tokenPriceService.save(pricesToUpsert);
    }

    this.logger.log('Fetching of tokens prices was successful!');
  }

  private async getTokens(): Promise<void> {
    const tokens = await this.soraApi.query.assets.assetInfos.entries();

    for (let [assetId, token] of tokens) {
      assetId = assetId.toHuman()[0].code;

      if (!whitelist.includes(assetId) && !synthetics.includes(assetId)) {
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
}
