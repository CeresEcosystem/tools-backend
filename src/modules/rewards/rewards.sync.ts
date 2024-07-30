import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RewardsService } from './rewards.service';
import { PairsService } from '../pairs/pairs.service';
import { TokenPriceService } from '../token-price/token-price.service';
import { CRON_DISABLED } from 'src/constants/constants';

const DOUBLE_POOLS = ['DAI', 'PSWAP', 'ETH', 'VAL', 'XST', 'TBCD'];

@Injectable()
export class RewardsSync {
  private readonly logger = new Logger(RewardsSync.name);

  constructor(
    private readonly tokenPriceService: TokenPriceService,
    private readonly pairsService: PairsService,
    private readonly rewardsService: RewardsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES, { disabled: CRON_DISABLED })
  async calculateFarmingRewards(): Promise<void> {
    this.logger.log('Start calculating farming rewards.');

    const pairs = await this.pairsService.findAll();
    const { price: xorPrice } = await this.tokenPriceService.findByToken('XOR');
    const { price: pswapPrice } = await this.tokenPriceService.findByToken(
      'PSWAP',
    );

    let baseAssetLiquidity = 0;

    pairs.forEach((pair) => {
      if (pair.baseAsset === 'XOR') {
        if (DOUBLE_POOLS.includes(pair.token)) {
          baseAssetLiquidity += 2 * pair.baseAssetLiq;
        } else {
          baseAssetLiquidity += pair.baseAssetLiq;
        }
      }
    });

    const pswapRewards = 2500000 / baseAssetLiquidity;
    const apr =
      (365 * 2500000 * pswapPrice * 100) / (baseAssetLiquidity * xorPrice * 2);

    this.rewardsService.save(apr, pswapRewards);

    this.logger.log('Calculating of farming rewards was successful!');
  }
}
