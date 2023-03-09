import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { LiquidityPairDTO } from './liquidity-pairs.dto';
import { LiquidityPairsService } from './liquidity-pairs.service';

const LIQUIDITY_PAIRS_URL = 'https://api.cerestoken.io/pairs-and-liquidity';

@Injectable()
export class LiquidityPairsListener {
  private readonly logger = new Logger(LiquidityPairsListener.name);

  constructor(
    private readonly liquidityPairsService: LiquidityPairsService,
    private readonly httpService: HttpService,
  ) {}

  // TODO: Phase II - Refactor this class to listen to changes on BC.

  @Cron(CronExpression.EVERY_3_MINUTES)
  async fetchLiquidityPairs(): Promise<void> {
    this.logger.log('Start downloading liquidity pairs.');

    const { data } = await firstValueFrom(
      this.httpService.get<LiquidityPairDTO[]>(LIQUIDITY_PAIRS_URL),
    );

    this.liquidityPairsService.save(data);

    this.logger.log('Downloading of liquidity pairs was successful!');
  }
}
