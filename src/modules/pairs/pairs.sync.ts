import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { catchError, firstValueFrom } from 'rxjs';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { LiquidityPairDTO } from './pairs.dto';
import { PairsService } from './pairs.service';
import { WsProvider } from '@polkadot/rpc-provider';
import {
  PROVIDER,
  XOR_ADDRESS,
  XSTUSD_ADDRESS,
} from '../../constants/constants';
import { ApiPromise } from '@polkadot/api/promise';
import { options } from '@sora-substrate/api';
import * as whitelist from '../../utils/files/whitelist.json';
import { TokenPriceService } from '../token-price/token-price.service';
import { FPNumber } from '@sora-substrate/math';
import { AxiosError } from 'axios';

const VOLUME_URL = 'https://stats.sora.org/pairs';
const BASE_ASSETS = [
  { symbol: 'XOR', name: 'SORA (XOR)', address: XOR_ADDRESS },
  {
    symbol: 'XSTUSD',
    name: 'SORA Synthetic USD (XSTUSD)',
    address: XSTUSD_ADDRESS,
  },
];
const DENOMINATOR = FPNumber.fromNatural(Math.pow(10, 18));

@Injectable()
export class PairsSync {
  private readonly logger = new Logger(PairsSync.name);
  private soraApi;
  private pairs: LiquidityPairDTO[] = [];

  constructor(
    private readonly pairsService: PairsService,
    private readonly tokenPriceService: TokenPriceService,
    private readonly httpService: HttpService,
  ) {
    const provider = new WsProvider(PROVIDER);
    new ApiPromise(options({ provider, noInitWarn: true })).isReady.then(
      (api) => {
        this.soraApi = api;
        this.getPairs().then();
      },
    );
  }

  async getPairs(): Promise<void> {
    for (const [index, baseAsset] of BASE_ASSETS.entries()) {
      await this.soraApi.rpc.tradingPair.listEnabledPairs(index, (pairList) => {
        pairList = pairList.toHuman();

        for (const pair of pairList) {
          const assetId = pair['targetAssetId'];

          if (!whitelist.includes(assetId)) {
            continue;
          }

          this.soraApi.rpc.assets.getAssetInfo(assetId, (info) => {
            info = info.toHuman();
            const assetSymbol = info['symbol'];
            const fullName = `${info['name']} (${assetSymbol})`;

            this.pairs.push({
              token: assetSymbol,
              tokenFullName: fullName,
              tokenAssetId: assetId,
              baseAsset: baseAsset.symbol,
              baseAssetFullName: baseAsset.name,
              baseAssetId: baseAsset.address,
            } as LiquidityPairDTO);
          });
        }
      });
    }
  }

  @Cron(CronExpression.EVERY_3_MINUTES)
  async fetchLiquidityPairs(): Promise<void> {
    this.logger.log('Start fetching pairs data.');

    const tokenPrices = await this.tokenPriceService.findAll();
    const xorPrice = tokenPrices.find((tp) => tp.token === 'XOR').price;
    const xstusdPrice = tokenPrices.find((tp) => tp.token === 'XSTUSD').price;

    const { data: volumeData } = await firstValueFrom(
      this.httpService.get<any>(VOLUME_URL, { timeout: 60_000 }).pipe(
        catchError((error: AxiosError) => {
          this.logger.warn(error.message, PairsSync.name);
          throw 'An error happened while fetching pairs from sora stats!';
        }),
      ),
    );

    const pairsToUpsert: LiquidityPairDTO[] = [];

    for (const pair of this.pairs) {
      const { token, baseAsset, baseAssetId, tokenAssetId } = pair;

      await this.soraApi.query.poolXYK.reserves(
        baseAssetId,
        tokenAssetId,
        async (liqArray) => {
          liqArray = liqArray.toHuman();

          if (new FPNumber(liqArray[0]).toNumber() === 0) {
            return;
          }

          const tokenPrice = tokenPrices.find((tp) => tp.token === token).price;

          const liqData = this.getLiquidityOfPair(
            liqArray,
            baseAsset,
            parseFloat(xorPrice),
            parseFloat(xstusdPrice),
            parseFloat(tokenPrice),
          );

          if (liqData.liquidity != null) {
            let volume = 0;
            const id = `${tokenAssetId}_${baseAssetId}`;
            const pairData = volumeData[id];
            const basePrice = baseAsset === 'XOR' ? xorPrice : xstusdPrice;
            if (pairData) {
              volume = pairData['quote_volume'] * parseFloat(basePrice);
            }
            if (!volume) {
              volume = 0;
            }

            pairsToUpsert.push({
              ...pair,
              liquidity: liqData.liquidity,
              baseAssetLiq: liqData.baseAssetLiq.toFixed(2),
              targetAssetLiq: liqData.targetAssetLiq.toFixed(2),
              volume: volume.toFixed(2),
            });
          }
        },
      );
    }

    if (pairsToUpsert.length > 0) {
      this.pairsService.save(pairsToUpsert);
    }

    this.logger.log('Fetching of pairs data was successful!');
  }

  private getLiquidityOfPair(
    liquidityArray,
    baseAsset: string,
    xorPrice: number,
    xstusdPrice: number,
    tokenPrice: number,
  ): { liquidity: number; baseAssetLiq: number; targetAssetLiq: number } {
    const baseAssetPrice: number = baseAsset === 'XOR' ? xorPrice : xstusdPrice;
    const baseAssetLiq = new FPNumber(liquidityArray[0])
      .div(DENOMINATOR)
      .toNumber();
    const targetAssetLiq = new FPNumber(liquidityArray[1])
      .div(DENOMINATOR)
      .toNumber();

    return {
      liquidity: Math.round(
        baseAssetLiq * baseAssetPrice + targetAssetLiq * tokenPrice,
      ),
      baseAssetLiq,
      targetAssetLiq,
    };
  }
}
