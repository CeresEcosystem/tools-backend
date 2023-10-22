import { Injectable, Logger } from '@nestjs/common';

import { WsProvider, ApiPromise } from '@polkadot/api';
import { FPNumber } from '@sora-substrate/math';
import { options } from '@sora-substrate/api';

import { XOR_ADDRESS, XSTUSD_ADDRESS, PROVIDER } from 'src/constants/constants';
import { TokenPriceService } from '../token-price/token-price.service';
import { ChronoPriceService } from '../chrono-price/chrono-price.service';
import { SwapService } from '../swaps/swaps.service';
import { PairsService } from '../pairs/pairs.service';
import { DeoClient } from '../deo-client/deo-client';

import { PortfolioDto } from './dto/portfolio.dto';
import { StakingDto } from './dto/staking.dto';
import { LiquidityDto } from './dto/liquidity.dto';
import { PortfolioValueDifferenceDto } from './dto/portfolio-value-difference.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { SwapDto } from '../swaps/dto/swap.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PriceChangeDto } from '../chrono-price/dto/price-change.dto';

const DENOMINATOR = FPNumber.fromNatural(Math.pow(10, 18));
const HOUR_INTERVALS = [1, 24, 24 * 7, 24 * 30];

@Injectable()
export class PortfolioService {
  private api;

  constructor(
    private tokenPriceService: TokenPriceService,
    private chronoPriceService: ChronoPriceService,
    private pairsService: PairsService,
    private deoClient: DeoClient,
    private swapsService: SwapService,
  ) {
    const provider = new WsProvider(PROVIDER);
    new ApiPromise(options({ provider, noInitWarn: true })).isReady.then(
      (api) => (this.api = api),
    );
  }

  public async getPortfolio(accountId: string): Promise<PortfolioDto[]> {
    let xor;

    try {
      xor = await this.api.rpc.assets.freeBalance(accountId, XOR_ADDRESS);
    } catch (error) {
      return [];
    }

    const value = !xor.isNone ? xor.unwrap() : { balance: 0 };
    const xorBalance = new FPNumber(value.balance).toNumber();

    const allTokenEntities = await this.tokenPriceService.findAll();

    let portfolio;

    try {
      portfolio = await this.api.query.tokens.accounts.entries(accountId);
    } catch (error) {
      return [];
    }

    console.time('Portfolio price changes');
    Logger.log('Start portfolio processing, count: ' + portfolio.length);

    const relevantPortfolioAssets: {
      assetId: string;
      assetAmount: number;
    }[] = [
      { assetId: XOR_ADDRESS, assetAmount: xorBalance },
      ...portfolio
        .map((portfolioAsset) => {
          const [assetsId, assetAmount] = portfolioAsset;
          const [, { code: assetId }] = assetsId.toHuman();
          const { free: assetBalance } = assetAmount.toHuman();

          return {
            assetId,
            assetAmount: new FPNumber(assetBalance).div(DENOMINATOR).toNumber(),
          };
        })
        .filter(({ assetAmount }) => assetAmount > 0)
        .filter(({ assetId }) =>
          allTokenEntities.some((token) => token.assetId === assetId),
        ),
    ];

    Logger.log('Relevant assets count: ' + relevantPortfolioAssets.length);

    const result = await Promise.all(
      relevantPortfolioAssets.map(async ({ assetId, assetAmount }) => {
        const tokenEntity = allTokenEntities.find(
          (token) => token.assetId === assetId,
        );

        console.time(`Price change for intervals ${tokenEntity.token}`);
        const priceChanges =
          await this.chronoPriceService.getPriceChangePerIntervals(
            tokenEntity,
            HOUR_INTERVALS,
          );
        console.timeEnd(`Price change for intervals ${tokenEntity.token}`);

        const [oneHour, oneDay, oneWeek, oneMonth] = this.calculatePriceChanges(
          priceChanges,
          assetAmount,
        );

        return {
          fullName: tokenEntity.fullName,
          token: tokenEntity.token,
          price: Number(tokenEntity.price),
          balance: assetAmount,
          value: Number(tokenEntity.price) * assetAmount,
          oneHour: oneHour.percentageDifference,
          oneHourValueDifference: oneHour.valueDifference,
          oneDay: oneDay.percentageDifference,
          oneDayValueDifference: oneDay.valueDifference,
          oneWeek: oneWeek.percentageDifference,
          oneWeekValueDifference: oneWeek.valueDifference,
          oneMonth: oneMonth.percentageDifference,
          oneMonthValueDifference: oneMonth.valueDifference,
        };
      }),
    );

    Logger.log('End portfolio processing');
    console.timeEnd('Portfolio price changes');
    return result;
  }

  public async getStakingPortfolio(accountId: string): Promise<StakingDto[]> {
    const stakingData: StakingDto[] = [];
    const pools = await this.deoClient.fetchStakingData(accountId);

    if (!pools) {
      return [];
    }

    //TODO: Use .filter and .map on pools array to create response
    for (const pool of pools) {
      const balance = FPNumber.fromCodecValue(pool.pooledTokens).toNumber();

      if (balance === 0) {
        continue;
      }

      //TODO: optimization - load all assets at once above the for loop
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

  public async getRewardsPortfolio(accountId: string): Promise<StakingDto[]> {
    const rewardsData: StakingDto[] = [];
    const rewardsMap = new Map();
    const stakingPools = await this.deoClient.fetchStakingData(accountId);
    const farmingPools = await this.deoClient.fetchFarmingData(accountId);

    if (stakingPools && farmingPools) {
      for (const pool of stakingPools) {
        const stakingReward = FPNumber.fromCodecValue(pool.rewards).toNumber();

        if (stakingReward === 0) {
          continue;
        }

        if (rewardsMap.has(pool.rewardAsset)) {
          const existingReward = rewardsMap.get(pool.rewardAsset);
          rewardsMap.set(pool.rewardAsset, existingReward + stakingReward);
        } else {
          rewardsMap.set(pool.rewardAsset, stakingReward);
        }
      }

      for (const pool of farmingPools) {
        const farmingReward = FPNumber.fromCodecValue(pool.rewards).toNumber();

        if (farmingReward == 0) {
          continue;
        }

        if (rewardsMap.has(pool.rewardAsset)) {
          const existingReward = rewardsMap.get(pool.rewardAsset);
          rewardsMap.set(pool.rewardAsset, existingReward + farmingReward);
        } else {
          rewardsMap.set(pool.rewardAsset, farmingReward);
        }
      }
    }

    //TODO: Use .map on rewardsMap array to create response, avoid loops where possible
    for (const [rewardAsset, balance] of rewardsMap) {
      //TODO: optimization - load all assets at once above the for loop
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

  public async getLiquidityPortfolio(
    accountId: string,
  ): Promise<LiquidityDto[]> {
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

  public async getSwapsPortfolio(
    pageOptions: PageOptionsDto,
    accountId: string,
  ): Promise<PageDto<SwapDto>> {
    return this.swapsService.findSwapsByAccount(pageOptions, accountId);
  }

  private calculatePriceChanges(
    priceChangeIntervals: PriceChangeDto[],
    balance: number,
  ): PortfolioValueDifferenceDto[] {
    return priceChangeIntervals.map((priceChange) => ({
      percentageDifference: priceChange.percentageDiff.toNumber(),
      valueDifference: priceChange.valueDiff.mul(balance).toNumber(),
    }));
  }

  private async getLiquidity(
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

      const percentageHolding = liquidityProviding / totalLiquidity;

      try {
        const pairData = await this.pairsService.findOneByAssetIds(
          XOR_ADDRESS,
          tokenAddress.toString(),
        );
        const value = pairData.liquidity * percentageHolding;

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
