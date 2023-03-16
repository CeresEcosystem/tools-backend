import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { LiquidityPairDTO } from './liquidity-pairs.dto';
import { LiquidityPairsService } from './liquidity-pairs.service';
import { WsProvider } from '@polkadot/rpc-provider';
import {
  PROVIDER,
  XOR_ADDRESS,
  XSTUSD_ADDRESS,
} from '../../constants/constants';
import { ApiPromise } from '@polkadot/api/promise';
import { options } from '@sora-substrate/api';
import * as whitelist from '../../utils/files/whitelist.json';
import { CurrentPriceService } from '../current-price/current-price.service';
import { FPNumber } from '@sora-substrate/math';

const VOLUME_URL = 'https://stats.sora.org/pairs';
const BASE_ASSETS = ['XOR', 'XSTUSD'];
const XOR_FULL_NAME = 'SORA (XOR)';
const XSTUSD_FULL_NAME = 'SORA Synthetic USD (XSTUSD)';
const DENOMINATOR = FPNumber.fromNatural(Math.pow(10, 18));

@Injectable()
export class LiquidityPairsListener {
  private readonly logger = new Logger(LiquidityPairsListener.name);
  private soraApi;
  private pairs;

  constructor(
    private readonly liquidityPairsService: LiquidityPairsService,
    private readonly currentPriceService: CurrentPriceService,
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
    this.pairs = [];
    for (const [index, base_asset] of BASE_ASSETS.entries()) {
      await this.soraApi.rpc.tradingPair.listEnabledPairs(index, (pairList) => {
        pairList = pairList.toHuman();
        for (let pair of pairList) {
          let asset_id = pair['targetAssetId'];
          if (!whitelist.includes(asset_id)) {
            continue;
          }
          this.soraApi.rpc.assets.getAssetInfo(asset_id, (info) => {
            info = info.toHuman();
            let asset_symbol = info['symbol'];
            let full_name = info['name'] + ' (' + asset_symbol + ')';
            this.pairs.push({
              token: asset_symbol,
              token_full_name: full_name,
              token_asset_id: asset_id,
              base_asset,
              base_asset_full_name:
                index === 0 ? XOR_FULL_NAME : XSTUSD_FULL_NAME,
              base_asset_id: index === 0 ? XOR_ADDRESS : XSTUSD_ADDRESS,
            });
          });
        }
      });
    }
  }

  @Cron(CronExpression.EVERY_3_MINUTES)
  async fetchLiquidityPairs(): Promise<void> {
    this.logger.log('Start fetching pairs data.');
    let pairs: LiquidityPairDTO[] = [];
    let { price: xorPrice } = await this.currentPriceService.findByToken('XOR');
    let { price: xstusdPrice } = await this.currentPriceService.findByToken(
      'XSTUSD',
    );
    const { data: volumeData } = await firstValueFrom(
      this.httpService.get<any>(VOLUME_URL),
    );

    for (let pair of this.pairs) {
      await this.soraApi.query.poolXYK.reserves(
        pair['base_asset_id'],
        pair['token_asset_id'],
        async (liqArray) => {
          liqArray = liqArray.toHuman();
          if (new FPNumber(liqArray[0]).toNumber() === 0) {
            return;
          }

          const token = pair['token'];
          const { price: tokenPrice } =
            await this.currentPriceService.findByToken(token);

          let liqData = this.getLiquidityOfPair(
            liqArray,
            pair['base_asset'],
            xorPrice,
            xstusdPrice,
            tokenPrice,
          );

          if (liqData['liquidity'] != null) {
            let volume = 0;
            const id = `${pair['token_asset_id']}_${pair['base_asset_id']}`;
            const pairData = volumeData[id];
            const basePrice =
              pair['base_asset'] === 'XOR' ? xorPrice : xstusdPrice;
            if (pairData) {
              volume = pairData['quote_volume'] * parseFloat(basePrice);
            }
            if (!volume) {
              volume = 0;
            }

            pairs.push({
              ...pair,
              liquidity: liqData['liquidity'],
              base_asset_liq: liqData['base_asset_liq'].toFixed(2),
              target_asset_liq: liqData['target_asset_liq'].toFixed(2),
              volume: volume.toFixed(2),
            });
          }
        },
      );
    }

    this.liquidityPairsService.save(pairs);

    this.logger.log('Fetching of pairs data was successful!');
  }

  private getLiquidityOfPair(
    liquidityArray,
    baseAsset,
    xorPrice,
    xstusdPrice,
    tokenPrice,
  ): any {
    let base_asset_price: number = baseAsset === 'XOR' ? xorPrice : xstusdPrice;
    let base_asset_liq = new FPNumber(liquidityArray[0])
      .div(DENOMINATOR)
      .toNumber();
    let target_asset_liq = new FPNumber(liquidityArray[1])
      .div(DENOMINATOR)
      .toNumber();

    return {
      liquidity: Math.round(
        base_asset_liq * base_asset_price + target_asset_liq * tokenPrice,
      ),
      base_asset_liq: base_asset_liq,
      target_asset_liq: target_asset_liq,
    };
  }
}
