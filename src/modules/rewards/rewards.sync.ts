import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { RewardsService } from './rewards.service';
import { PairsService } from '../pairs/pairs.service';
import { TokenPriceService } from '../token-price/token-price.service';

const DOUBLE_POOLS = ['DAI', 'PSWAP', 'ETH', 'VAL', 'XST', 'TBCD'];

@Injectable()
export class RewardsSync {
  private readonly logger = new Logger(RewardsSync.name);

  constructor(
    private readonly tokenPriceService: TokenPriceService,
    private readonly pairsService: PairsService,
    private readonly rewardsService: RewardsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async calculateFarmingRewards(): Promise<void> {
    this.logger.log('Start calculating farming rewards.');

    const pairs = await this.pairsService.findAll();
    const { price: xorPrice } = await this.tokenPriceService.findByToken('XOR');
    const { price: pswapPrice } = await this.tokenPriceService.findByToken(
      'PSWAP',
    );

    let baseAssetLiquidity = 0;

    pairs.forEach((pair) => {
      if (pair.baseAsset === 'XOR' && DOUBLE_POOLS.includes(pair.token)) {
        baseAssetLiquidity += pair.baseAssetLiq;
      }
    });

    const pswapRewards = 2500000 / baseAssetLiquidity;
    const apr =
      (365 * 2500000 * parseFloat(pswapPrice) * 100) /
      (baseAssetLiquidity * parseFloat(xorPrice) * 2);

    this.rewardsService.save(apr.toFixed(2), pswapRewards.toFixed(2));

    this.logger.log('Calculating of farming rewards was successful!');
  }
}
