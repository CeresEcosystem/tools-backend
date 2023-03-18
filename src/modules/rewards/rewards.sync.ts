import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { RewardsService } from './rewards.service';
import { PairsService } from '../pairs/pairs.service';
import { TokenPriceService } from '../token-price/token-price.service';

@Injectable()
export class RewardsSync {
  private readonly logger = new Logger(RewardsSync.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly tokenPriceService: TokenPriceService,
    private readonly pairsService: PairsService,
    private readonly rewardsService: RewardsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchFarmingRewards(): Promise<void> {
    this.logger.log('Start calculating farming rewards.');
    const pairs = await this.pairsService.findAll();
    const { price: xorPrice } = await this.tokenPriceService.findByToken('XOR');
    const { price: pswapPrice } = await this.tokenPriceService.findByToken(
      'PSWAP',
    );
    const doublePools = ['DAI', 'PSWAP', 'ETH', 'VAL', 'XST'];

    let baseAssetLiquidity = 0;
    for (let pair of pairs) {
      if (pair.baseAsset === 'XOR' && doublePools.includes(pair.token)) {
        baseAssetLiquidity += pair.baseAssetLiq;
      }
    }

    const pswapRewards = 2500000 / baseAssetLiquidity;
    const apr =
      (365 * 2500000 * parseFloat(pswapPrice) * 100) /
      (baseAssetLiquidity * parseFloat(xorPrice) * 2);

    const rewards = {
      apr: apr.toFixed(2),
      rewards: pswapRewards.toFixed(2),
      aprDouble: (apr * 2).toFixed(2),
      rewardsDouble: (pswapRewards * 2).toFixed(2),
    };

    this.rewardsService.save(rewards);

    this.logger.log('Calculating of farming rewards was successful!');
  }
}
