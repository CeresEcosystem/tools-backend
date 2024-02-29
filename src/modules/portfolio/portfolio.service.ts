import { Injectable, Logger } from '@nestjs/common';
import { FPNumber } from '@sora-substrate/math';
import { XOR_ADDRESS, XSTUSD_ADDRESS } from 'src/constants/constants';
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
import { SoraClient } from '../sora-client/sora-client';
import { Pair } from '../pairs/entity/pairs.entity';

const DENOMINATOR = FPNumber.fromNatural(10 ** 18);
const HOUR_INTERVALS = [1, 24, 24 * 7, 24 * 30];

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    private readonly tokenPriceService: TokenPriceService,
    private readonly chronoPriceService: ChronoPriceService,
    private readonly pairsService: PairsService,
    private readonly deoClient: DeoClient,
    private readonly swapsService: SwapService,
    private readonly soraClient: SoraClient,
  ) {}

  public async getPortfolio(accountId: string): Promise<PortfolioDto[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();

    let xor;

    try {
      xor = await soraApi.rpc.assets.freeBalance(accountId, XOR_ADDRESS);
    } catch (error) {
      return [];
    }

    const value = xor.isNone ? { balance: 0 } : xor.unwrap();
    const xorBalance = new FPNumber(value.balance).toNumber();

    const allTokenEntities = await this.tokenPriceService.findAll();

    let portfolio;

    try {
      portfolio = await soraApi.query.tokens.accounts.entries(accountId);
    } catch (error) {
      return [];
    }

    this.logger.log(`Start portfolio processing, count: ${portfolio.length}`);

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

    this.logger.log(`Relevant assets count: ${relevantPortfolioAssets.length}`);

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

    this.logger.log('End portfolio processing');

    return result;
  }

  public async getStakingPortfolio(accountId: string): Promise<StakingDto[]> {
    const pools = await this.deoClient.fetchStakingData(accountId);
    const allTokenEntities = await this.tokenPriceService.findAll();

    if (!pools) {
      return [];
    }

    const stakedTokens = pools
      .filter((pool) => pool.pooledTokens > 0)
      .map((pool) => {
        const tokenEntity = allTokenEntities.find(
          (entity) => entity.assetId === pool.poolAsset,
        );

        const balance = pool.pooledTokens;
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

    if (!stakingPools || !farmingPools) {
      return [];
    }

    const rewards: StakingDto[] = [...stakingPools, ...farmingPools]
      .filter(({ rewards }) => rewards > 0)
      .reduce((accumulatedTokens, pool) => {
        const { rewardAsset } = pool;
        const rewardAmount = pool.rewards;

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
    const soraApi = await this.soraClient.getSoraApi();

    let poolSetXOR;
    let poolSetXSTUSD;

    try {
      poolSetXOR = await soraApi.query.poolXYK.accountPools(
        accountId,
        XOR_ADDRESS,
      );
      poolSetXSTUSD = await soraApi.query.poolXYK.accountPools(
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

  public getSwapsPortfolio(
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();
    const liquidityData: LiquidityDto[] = [];
    let pairData: Pair;

    for (const { code: tokenAddress } of poolSet) {
      const [poolAddress] = (
        await soraApi.query.poolXYK.properties(baseAssetId, tokenAddress)
      ).toHuman();

      const liquidityProviding = await soraApi.query.poolXYK.poolProviders(
        poolAddress,
        accountId,
      );

      const totalLiquidity = await soraApi.query.poolXYK.totalIssuances(
        poolAddress,
      );

      const percentageHolding = liquidityProviding / totalLiquidity;

      try {
        if (baseAssetId === XOR_ADDRESS) {
          pairData = await this.pairsService.findOneByAssetIds(
            XOR_ADDRESS,
            tokenAddress.toString(),
          );
        } else {
          pairData = await this.pairsService.findOneByAssetIds(
            XSTUSD_ADDRESS,
            tokenAddress.toString(),
          );
        }

        const value = pairData.liquidity * percentageHolding;

        const baseAssetLiqHolding = pairData.baseAssetLiq * percentageHolding;
        const tokenLiqHolding = pairData.targetAssetLiq * percentageHolding;

        liquidityData.push({
          token: pairData.token,
          tokenLiqHolding,
          baseAsset: pairData.baseAsset,
          baseAssetLiqHolding,
          value,
        });
      } catch (error) {}
    }

    return liquidityData;
  }
}
