import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FPNumber } from '@sora-substrate/math';

import { TokenPriceBcDto } from './dto/token-price-bc.dto';
import { TokenPriceService } from './token-price.service';

import * as whitelist from 'src/utils/files/whitelist.json';
import * as synthetics from 'src/utils/files/synthetics.json';
import { SoraClient } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { CRON_DISABLED, IS_WORKER_INSTANCE } from 'src/constants/constants';

const DENOMINATOR = FPNumber.fromNatural(10 ** 18);
const DAI_ADDRESS =
  '0x0200060000000000000000000000000000000000000000000000000000000000';
const HUNDREDS = ['HOT', 'UMI', 'SOSHIBA'];
const BILLIONS = ['MEOW'];
const MILLI = ['ETH'];
const TMILLI = ['PUSSY'];

@Injectable()
export class TokenPriceSync {
  private readonly logger = new Logger(TokenPriceSync.name);
  private tokens: TokenPriceBcDto[] = [];

  constructor(
    private readonly tokenPriceService: TokenPriceService,
    private readonly soraClient: SoraClient,
  ) {
    if (IS_WORKER_INSTANCE) {
      this.loadTokens();
    }
  }

  @Cron(CronExpression.EVERY_MINUTE, { disabled: CRON_DISABLED })
  async fetchTokenPrices(): Promise<void> {
    this.logger.log('Start fetching tokens prices.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();
    const pricesToUpsert: TokenPriceBcDto[] = [];

    for (const token of this.tokens) {
      if (synthetics.includes(token.assetId)) {
        // Get price via band query
        const result = await soraApi.query.band.symbolRates(
          token.symbol.substring(3),
        );

        const data = result.toHuman();
        const price = new FPNumber(data.value).div(DENOMINATOR).toNumber();

        pricesToUpsert.push({ ...token, price });
      } else {
        // Get price via token liquidity

        const { symbol } = token;
        let amount = 1;

        if (HUNDREDS.includes(symbol)) {
          amount = 100;
        } else if (BILLIONS.includes(symbol)) {
          amount = 1000000000;
        } else if (MILLI.includes(symbol)) {
          amount = 0.001;
        } else if (TMILLI.includes(symbol)) {
          amount = 0.0001;
        }

        await soraApi.rpc.liquidityProxy.quote(
          0,
          token.assetId,
          DAI_ADDRESS,
          FPNumber.fromNatural(amount).toCodecString(),
          'WithDesiredInput',
          ['XYKPool'],
          'Disabled',
          (result) => {
            const value = result.isNone
              ? { amount: 0, fee: {}, rewards: [], amountWithoutImpact: 0 }
              : result.unwrap();

            let price = new FPNumber(value.amount).toNumber();
            price = HUNDREDS.includes(symbol)
              ? Number((price / 100).toFixed(8))
              : price;
            price = BILLIONS.includes(symbol)
              ? Number((price / 1000000000).toFixed(12))
              : price;
            price = MILLI.includes(symbol)
              ? Number((price / 0.001).toFixed(12))
              : price;
            price = TMILLI.includes(symbol)
              ? Number((price / 0.0001).toFixed(12))
              : price;

            pricesToUpsert.push({
              ...token,
              price: symbol === 'DAI' ? 1 : price,
            });
          },
        );
      }
    }

    if (pricesToUpsert.length > 0) {
      await this.tokenPriceService.save(pricesToUpsert);
    }

    this.logger.log('Fetching of tokens prices was successful!');
  }

  private async loadTokens(): Promise<void> {
    this.tokens = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();
    const tokens = await soraApi.query.assets.assetInfos.entries();

    for (let [assetId, token] of tokens) {
      assetId = assetId.toHuman()[0].code;

      if (!whitelist.includes(assetId) && !synthetics.includes(assetId)) {
        continue;
      }

      token = token.toHuman();
      const [assetSymbol] = token;
      const fullName = `${token[1]} (${assetSymbol})`;

      this.tokens.push({
        symbol: assetSymbol,
        assetId,
        fullName,
      } as TokenPriceBcDto);
    }

    this.fetchTokenPrices();
  }
}
