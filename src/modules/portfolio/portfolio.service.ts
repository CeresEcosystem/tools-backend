import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { FPNumber } from '@sora-substrate/math';
import { XOR_ADDRESS, PROVIDER } from 'src/constants/constants';
import { options } from '@sora-substrate/api';
import { PortfolioDto } from './dto/portfolio.dto';
import { StakingDto } from './dto/staking.dto';
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
    private httpService: HttpService,
  ) {
    const provider = new WsProvider(PROVIDER);
    new ApiPromise(options({ provider, noInitWarn: true })).isReady.then(
      (api) => (this.api = api),
    );
  }

  async fetchStakingData(accountId) {
    const { data } = await firstValueFrom(
      this.httpService.get<any>(
        `https://farming-api.cerestoken.io/get-pools?accountId=${accountId}`,
      ),
    );
    return data;
  }

  async fetchFarmingData(accountId) {
    const { data } = await firstValueFrom(
      this.httpService.get<any>(
        `https://farming-api.cerestoken.io/get-farms?accountId=${accountId}`,
      ),
    );
    return data;
  }

  async getPortfolio(accountId: string): Promise<PortfolioDto[]> {
    const timestamp = Math.floor(Date.now() / 1000);
    const timestampBefore30Days = timestamp - 2592000;

    const URL_XOR = `${URL}from=${timestampBefore30Days}&to=${timestamp}`;
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

    return [];
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

  async getStakingPortfolio(accountId: string): Promise<StakingDto[]> {
    let stakingData: StakingDto[] = [];
    const pools = await this.fetchStakingData(accountId);
    for (const pool of pools) {
      let balance = FPNumber.fromCodecValue(pool.pooledTokens).toNumber();
      if (balance === 0) continue;
      const tokenEntity = await this.tokenPriceService.findByAssetId(
        pool.poolAsset,
      );
      stakingData.push({
        fullName: tokenEntity.fullName,
        token: tokenEntity.token,
        price: Number(tokenEntity.price),
        balance,
        value: Number(tokenEntity.price) * balance,
      });
    }
    return stakingData;
  }

  async getRewardsPortfolio(accountId: string): Promise<StakingDto[]> {
    let rewardsData: StakingDto[] = [];
    const rewardsMap = new Map();
    const stakingPools = await this.fetchStakingData(accountId);
    const farmingPools = await this.fetchFarmingData(accountId);

    for (const pool of stakingPools) {
      let stakingReward = FPNumber.fromCodecValue(pool.rewards).toNumber();
      if (stakingReward === 0) continue;
      if (rewardsMap.has(pool.rewardAsset)) {
        const existingReward = rewardsMap.get(pool.rewardAsset);
        rewardsMap.set(pool.rewardAsset, existingReward + stakingReward);
      } else {
        rewardsMap.set(pool.rewardAsset, stakingReward);
      }
    }

    for (const pool of farmingPools) {
      let farmingReward = FPNumber.fromCodecValue(pool.rewards).toNumber();
      if (farmingReward == 0) continue;
      if (rewardsMap.has(pool.rewardAsset)) {
        const existingReward = rewardsMap.get(pool.rewardAsset);
        rewardsMap.set(pool.rewardAsset, existingReward + farmingReward);
      } else {
        rewardsMap.set(pool.rewardAsset, farmingReward);
      }
    }

    for (const [rewardAsset, balance] of rewardsMap) {
      const tokenEntity = await this.tokenPriceService.findByAssetId(
        rewardAsset,
      );
      rewardsData.push({
        fullName: tokenEntity.fullName,
        token: tokenEntity.token,
        price: Number(tokenEntity.price),
        balance,
        value: Number(tokenEntity.price) * balance,
      });
    }

    return rewardsData;
  }
}
