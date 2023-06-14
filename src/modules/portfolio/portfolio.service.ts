import { Injectable } from '@nestjs/common';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { FPNumber } from '@sora-substrate/math';
import { XOR_ADDRESS, PROVIDER } from 'src/constants/constants';
import { options } from '@sora-substrate/api';
import { PortfolioDto } from './dto/portfolio.dto';
import { TokenPriceService } from '../token-price/token-price.service';
import { ChronoPriceService } from '../chrono-price/chrono-price.service';

const DENOMINATOR = FPNumber.fromNatural(Math.pow(10, 18));
const intervals = [2, 48, 336, 1440];

@Injectable()
export class PortfolioService {
  private api;

  constructor(
    private tokenPriceService: TokenPriceService,
    private chronoPriceService: ChronoPriceService,
  ) {
    const provider = new WsProvider(PROVIDER);
    new ApiPromise(options({ provider, noInitWarn: true })).isReady.then(
      (api) => (this.api = api),
    );
  }

  async getPortfolio(accountId: string): Promise<PortfolioDto[]> {
    const timestamp = Math.floor(Date.now() / 1000);
    const timestampBefore30Days = timestamp - 2592000;

    let assetIdsAndAssetBalances: PortfolioDto[] = [];

    const xor = await this.api.rpc.assets.freeBalance(accountId, XOR_ADDRESS);
    const value = !xor.isNone ? xor.unwrap() : { balance: 0 };
    const balance = new FPNumber(value.balance).toNumber();
    const tokenEntity = await this.tokenPriceService.findByAssetId(XOR_ADDRESS);

    const { o: prices } = await this.chronoPriceService.getPriceForChart(
      tokenEntity.token,
      30,
      timestampBefore30Days,
      timestamp,
      0,
    );

    const [oneHour, oneDay, oneWeek, oneMonth] = this.calculatePriceChanges(
      prices,
      Number(tokenEntity.price),
    );

    assetIdsAndAssetBalances.push({
      fullName: tokenEntity.fullName,
      token: tokenEntity.token,
      price: Number(tokenEntity.price),
      balance,
      value: Number(tokenEntity.price) * balance,
      oneHour,
      oneDay,
      oneWeek,
      oneMonth,
    });

    const portfolio = await this.api.query.tokens.accounts.entries(accountId);

    for (const [assetsId, assetAmount] of portfolio) {
      let { free: assetBalance } = assetAmount.toHuman();
      let balance = new FPNumber(assetBalance).div(DENOMINATOR).toNumber();
      if (balance === 0) continue;

      let [, { code: assetId }] = assetsId.toHuman();
      try {
        let tokenEntity = await this.tokenPriceService.findByAssetId(assetId);

        const { o: prices } = await this.chronoPriceService.getPriceForChart(
          tokenEntity.token,
          30,
          timestampBefore30Days,
          timestamp,
          0,
        );
        const [oneHour, oneDay, oneWeek, oneMonth] = this.calculatePriceChanges(
          prices,
          Number(tokenEntity.price),
        );

        assetIdsAndAssetBalances.push({
          fullName: tokenEntity.fullName,
          token: tokenEntity.token,
          price: Number(tokenEntity.price),
          balance,
          value: Number(tokenEntity.price) * balance,
          oneHour,
          oneDay,
          oneWeek,
          oneMonth,
        });
      } catch (error) {}
    }

    return assetIdsAndAssetBalances;
  }

  calculatePriceChanges(prices, tokenPrice): number[] {
    let priceDifferenceInPercentageArr: number[] = [];
    intervals.forEach((interval) => {
      let beforePrice = prices[prices.length - interval];
      let priceInPercentage =
        Math.round((tokenPrice / beforePrice - 1) * 100 * 100) / 100;

      priceDifferenceInPercentageArr.push(priceInPercentage);
    });
    return priceDifferenceInPercentageArr;
  }
}
