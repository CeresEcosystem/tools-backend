import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { catchError, firstValueFrom, retry } from 'rxjs';
import { FPNumber } from '@sora-substrate/math';
import { AxiosError } from 'axios';

import { TokenPriceService } from '../token-price/token-price.service';
import { TokenPrice } from '../token-price/entity/token-price.entity';

import { CronExpression } from 'src/utils/cron-expression.enum';
import { PairBcDto } from './dto/pair-bc.dto';
import { PairsService } from './pairs.service';
import { SoraClient } from '../sora-client/sora-client';
import { XOR_ADDRESS, XSTUSD_ADDRESS } from '../../constants/constants';
import * as Sentry from '@sentry/node';

import * as whitelist from '../../utils/files/whitelist.json';
import * as synthetics from 'src/utils/files/synthetics.json';

const VOLUME_URL = 'https://stats.sora.org/pairs';
const BASE_ASSETS = [
  { symbol: 'XOR', name: 'SORA (XOR)', address: XOR_ADDRESS },
  {
    symbol: 'XSTUSD',
    name: 'SORA Synthetic USD (XSTUSD)',
    address: XSTUSD_ADDRESS,
  },
];
const DENOMINATOR = FPNumber.fromNatural(10 ** 18);

@Injectable()
export class PairsSync {
  private readonly logger = new Logger(PairsSync.name);
  private pairs: PairBcDto[] = [];

  constructor(
    private readonly pairsService: PairsService,
    private readonly tokenPriceService: TokenPriceService,
    private readonly httpService: HttpService,
    private readonly soraClient: SoraClient,
  ) {
    this.getPairs();
  }

  @Cron(CronExpression.EVERY_3_MINUTES)
  async fetchLiquidityPairs(): Promise<void> {
    const transaction = Sentry.startTransaction({
      op: 'fetchLiquidityPairs',
      name: 'Fetch Liquidity Pairs',
    });

    this.logger.log('Start fetching pairs data.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();
    const volumeData = await this.fetchSoraPairs();

    if (!volumeData) {
      this.logger.log('Cancel updating pairs data.');

      return;
    }

    const tokenPrices = await this.tokenPriceService.findAll();

    for (const pair of this.pairs) {
      const { token, baseAsset, baseAssetId, tokenAssetId } = pair;

      if (
        !tokenPrices.some((tp) => tp.token === baseAsset) ||
        !tokenPrices.some((tp) => tp.token === token)
      ) {
        continue;
      }

      let liqArray = await soraApi.query.poolXYK.reserves(
        baseAssetId,
        tokenAssetId,
      );
      liqArray = liqArray.toHuman();

      if (Number(liqArray[0]) === 0) {
        continue;
      }

      const { basePrice, targetPrice } = this.getBaseAndTargetPrices(
        tokenPrices,
        token,
        baseAsset,
      );

      const liqData = this.getLiquidityOfPair(liqArray, basePrice, targetPrice);

      if (!liqData.liquidity) {
        continue;
      }

      const pairData = volumeData[`${tokenAssetId}_${baseAssetId}`];
      const volume = pairData ? pairData.quote_volume * basePrice : 0;

      this.pairsService.save([
        {
          ...pair,
          liquidity: liqData.liquidity,
          baseAssetLiq: liqData.baseAssetLiq.toFixed(2),
          targetAssetLiq: liqData.targetAssetLiq.toFixed(2),
          volume: volume.toFixed(2),
        },
      ]);
    }

    this.logger.log('Fetching of pairs data was successful!');

    transaction.finish();
  }

  private getBaseAndTargetPrices(
    tokenPrices: TokenPrice[],
    targetAsset: string,
    baseAsset: string,
  ): { basePrice: number; targetPrice: number } {
    const basePrice = tokenPrices.find((tp) => tp.token === baseAsset).price;
    const targetPrice = tokenPrices.find(
      (tp) => tp.token === targetAsset,
    ).price;

    return {
      basePrice,
      targetPrice,
    };
  }

  private async getPairs(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();

    for (const [index, baseAsset] of BASE_ASSETS.entries()) {
      await soraApi.rpc.tradingPair.listEnabledPairs(index, (pairList) => {
        const pairListHuman = pairList.toHuman();

        for (const pair of pairListHuman) {
          const assetId = pair.targetAssetId;

          if (!whitelist.includes(assetId) && !synthetics.includes(assetId)) {
            continue;
          }

          soraApi.rpc.assets.getAssetInfo(assetId, (info) => {
            const infoHuman = info.toHuman();
            const assetSymbol = infoHuman.symbol;
            const fullName = `${infoHuman.name} (${assetSymbol})`;

            this.pairs.push({
              token: assetSymbol,
              tokenFullName: fullName,
              tokenAssetId: assetId,
              baseAsset: baseAsset.symbol,
              baseAssetFullName: baseAsset.name,
              baseAssetId: baseAsset.address,
            } as PairBcDto);
          });
        }
      });
    }
  }

  private async fetchSoraPairs<T>(): Promise<T> {
    const { data } = await firstValueFrom(
      this.httpService.get<T>(VOLUME_URL, { timeout: 2000 }).pipe(
        retry({ count: 30, delay: 1000 }),
        catchError((error: AxiosError) => {
          this.logWarning(error);
          throw new BadGatewayException('Sora Stats API unreachable.');
        }),
      ),
    );

    return data;
  }

  private getLiquidityOfPair(
    liquidityArray: string[],
    basePrice: number,
    tokenPrice: number,
  ): { liquidity: number; baseAssetLiq: number; targetAssetLiq: number } {
    const baseAssetLiq = new FPNumber(liquidityArray[0])
      .div(DENOMINATOR)
      .toNumber();
    const targetAssetLiq = new FPNumber(liquidityArray[1])
      .div(DENOMINATOR)
      .toNumber();

    return {
      liquidity: Math.round(
        baseAssetLiq * basePrice + targetAssetLiq * tokenPrice,
      ),
      baseAssetLiq,
      targetAssetLiq,
    };
  }

  private logWarning(error: AxiosError): void {
    this.logger.warn(
      `An error happened while fetching pairs from sora stats!
      msg: ${error.message}, code: ${error.code}, cause: ${error.cause}`,
    );
  }
}
