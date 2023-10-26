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

    const relevantTokens = allTokenEntities.filter((token) =>
      relevantPortfolioAssets.some((asset) => asset.assetId === token.assetId),
    );

    const relevantTokenPriceChanges =
      await this.chronoPriceService.getPriceChangePerIntervals(
        relevantTokens,
        HOUR_INTERVALS,
      );

    const result = relevantPortfolioAssets.map(({ assetId, assetAmount }) => {
      const tokenEntity = allTokenEntities.find(
        (token) => token.assetId === assetId,
      );

      const priceChanges = relevantTokenPriceChanges
        .filter((priceChange) => priceChange.token === tokenEntity.token)
        .sort((priceChange) => priceChange.intervalHours);

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
    });

    Logger.log('End portfolio processing');
    console.timeEnd('Portfolio price changes');
    return result;
  }

  public async getStakingPortfolio(accountId: string): Promise<StakingDto[]> {
    const pools = await this.deoClient.fetchStakingData(accountId);
    const allTokenEntities = await this.tokenPriceService.findAll();

    if (!pools) {
      return [];
    }

    const stakedTokens = pools
      .filter(
        (pool) => FPNumber.fromCodecValue(pool.pooledTokens).toNumber() > 0,
      )
      .map((pool) => {
        const tokenEntity = allTokenEntities.find(
          (entity) => entity.assetId === pool.poolAsset,
        );

        const balance = FPNumber.fromCodecValue(pool.pooledTokens).toNumber();
        const price = Number(tokenEntity.price);

        return {
          fullName: tokenEntity.fullName,
          token: tokenEntity.token,
          price,
          balance,
          value: price * balance,
        };
      });

    return stakedTokens;
  }

  public async getRewardsPortfolio(accountId: string): Promise<StakingDto[]> {
    const stakingPools = await this.deoClient.fetchStakingData(accountId);
    const farmingPools = await this.deoClient.fetchFarmingData(accountId);
    const allTokenEntities = await this.tokenPriceService.findAll();

    if (!stakingPools || !farmingPools) return;
    const rewards: StakingDto[] = [...stakingPools, ...farmingPools]
      .filter(({ rewards }) => FPNumber.fromCodecValue(rewards).toNumber() > 0)
      .reduce((accumulatedTokens, pool) => {
        const rewardAsset = pool.rewardAsset;
        const rewardAmount = FPNumber.fromCodecValue(pool.rewards).toNumber();

        const existingAsset = accumulatedTokens.find(
          (token) => token.rewardAsset === rewardAsset,
        );

        if (existingAsset) {
          existingAsset.rewardAmount += rewardAmount;
        } else {
          accumulatedTokens.push({ rewardAsset, rewardAmount });
        }

        return accumulatedTokens;
      }, [])
      .map((accumulatedTokens) => {
        const entity = allTokenEntities.find(
          (token) => token.assetId === accumulatedTokens.rewardAsset,
        );

        return {
          fullName: entity.fullName,
          token: entity.token,
          price: Number(entity.price),
          balance: accumulatedTokens.rewardAmount,
          value: Number(entity.price) * accumulatedTokens.rewardAmount,
        };
      });
    return rewards;
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
