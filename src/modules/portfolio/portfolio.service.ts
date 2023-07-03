import { Injectable } from '@nestjs/common';

import { WsProvider, ApiPromise } from '@polkadot/api';
import { FPNumber } from '@sora-substrate/math';
import { options } from '@sora-substrate/api';

import { XOR_ADDRESS, XSTUSD_ADDRESS, PROVIDER } from 'src/constants/constants';
import { TokenPriceService } from '../token-price/token-price.service';
import { ChronoPriceService } from '../chrono-price/chrono-price.service';
import { PairsService } from '../pairs/pairs.service';
import { DeoClient } from '../deo-client/deo-client';

import { PortfolioDto } from './dto/portfolio.dto';
import { StakingDto } from './dto/staking.dto';
import { LiquidityDto } from './dto/liquidity.dto';

const DENOMINATOR = FPNumber.fromNatural(Math.pow(10, 18));
const intervals = [2, 48, 336, 1440];

@Injectable()
export class PortfolioService {
  private api;

  constructor(
    private tokenPriceService: TokenPriceService,
    private chronoPriceService: ChronoPriceService,
    private pairsService: PairsService,
    private deoClient: DeoClient,
  ) {
    const provider = new WsProvider(PROVIDER);
    new ApiPromise(options({ provider, noInitWarn: true })).isReady.then(
      (api) => (this.api = api),
    );
  }

  async getPortfolio(accountId: string): Promise<PortfolioDto[]> {
    const timestamp = Math.floor(Date.now() / 1000);
    const timestampBefore30Days = timestamp - 2592000;

    const assetIdsAndAssetBalances: PortfolioDto[] = [];
    let xor;
    let portfolio;

    try {
      xor = await this.api.rpc.assets.freeBalance(accountId, XOR_ADDRESS);
    } catch (error) {
      return assetIdsAndAssetBalances;
    }
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

    try {
      portfolio = await this.api.query.tokens.accounts.entries(accountId);
    } catch (error) {
      return assetIdsAndAssetBalances;
    }

    for (const [assetsId, assetAmount] of portfolio) {
      const { free: assetBalance } = assetAmount.toHuman();
      const balance = new FPNumber(assetBalance).div(DENOMINATOR).toNumber();
      if (balance === 0) continue;

      const [, { code: assetId }] = assetsId.toHuman();
      try {
        const tokenEntity = await this.tokenPriceService.findByAssetId(assetId);

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
    const priceDifferenceInPercentageArr: number[] = [];
    intervals.forEach((interval) => {
      let beforePrice = prices[prices.length - interval];
      let priceInPercentage =
        Math.round((tokenPrice / beforePrice - 1) * 100 * 100) / 100;

      priceDifferenceInPercentageArr.push(priceInPercentage);
    });
    return priceDifferenceInPercentageArr;
  }

  async getStakingPortfolio(accountId: string): Promise<StakingDto[]> {
    const stakingData: StakingDto[] = [];
    const pools = await this.deoClient.fetchStakingData(accountId);
    if (pools)
      for (const pool of pools) {
        const balance = FPNumber.fromCodecValue(pool.pooledTokens).toNumber();
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
    const rewardsData: StakingDto[] = [];
    const rewardsMap = new Map();
    const stakingPools = await this.deoClient.fetchStakingData(accountId);
    const farmingPools = await this.deoClient.fetchFarmingData(accountId);
    if (stakingPools && farmingPools) {
      for (const pool of stakingPools) {
        const stakingReward = FPNumber.fromCodecValue(pool.rewards).toNumber();
        if (stakingReward === 0) continue;
        if (rewardsMap.has(pool.rewardAsset)) {
          const existingReward = rewardsMap.get(pool.rewardAsset);
          rewardsMap.set(pool.rewardAsset, existingReward + stakingReward);
        } else {
          rewardsMap.set(pool.rewardAsset, stakingReward);
        }
      }
      for (const pool of farmingPools) {
        const farmingReward = FPNumber.fromCodecValue(pool.rewards).toNumber();
        if (farmingReward == 0) continue;
        if (rewardsMap.has(pool.rewardAsset)) {
          const existingReward = rewardsMap.get(pool.rewardAsset);
          rewardsMap.set(pool.rewardAsset, existingReward + farmingReward);
        } else {
          rewardsMap.set(pool.rewardAsset, farmingReward);
        }
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

  async getLiquidityPortfolio(accountId: string): Promise<LiquidityDto[]> {
    let poolSetXOR;
    let poolSetXSTUSD;

    try {
      poolSetXOR = await this.api.query.poolXYK.accountPools(
        accountId,
        XOR_ADDRESS,
      );
      poolSetXSTUSD = await this.api.query.poolXYK.accountPools(
        accountId,
        XSTUSD_ADDRESS,
      );
    } catch (error) {
      return [];
    }

    const liquidityXOR = await this.getLiquidity(
      poolSetXOR,
      XOR_ADDRESS,
      accountId,
    );

    const liquidityXSTUSD = await this.getLiquidity(
      poolSetXSTUSD,
      XSTUSD_ADDRESS,
      accountId,
    );

    return [...liquidityXOR, ...liquidityXSTUSD];
  }

  async getLiquidity(
    poolSet,
    baseAssetId: string,
    accountId: string,
  ): Promise<LiquidityDto[]> {
    const liquidityData: LiquidityDto[] = [];
    for (const { code: tokenAddress } of poolSet) {
      const [poolAddress] = (
        await this.api.query.poolXYK.properties(baseAssetId, tokenAddress)
      ).toHuman();

      const liquidityProviding = await this.api.query.poolXYK.poolProviders(
        poolAddress,
        accountId,
      );

      const totalLiquidity = await this.api.query.poolXYK.totalIssuances(
        poolAddress,
      );

      let percentageHolding = liquidityProviding / totalLiquidity;

      try {
        const pairData = await this.pairsService.findOneByAssetIds(
          XOR_ADDRESS,
          tokenAddress.toString(),
        );
        let value = pairData.liquidity * percentageHolding;

        liquidityData.push({
          token: pairData.token,
          baseAsset: pairData.baseAsset,
          value,
        });
      } catch (error) {}
    }

    return liquidityData;
  }
}
