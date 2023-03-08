import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { Repository } from 'typeorm';
import { LIQUIDITY_PAIRS_URL } from './liquidity-pairs.const';
import { LiquidityPairDTO } from './liquidity-pairs.dto';
import { LiquidityPair } from './liquidity-pairs.entity';
import { LiquidityPairsMapper } from './liquidity-pairs.mapper';

@Injectable()
export class LiquidityPairsService {
  private readonly logger = new Logger(LiquidityPairsService.name);

  constructor(
    @InjectRepository(LiquidityPair)
    private readonly liquidityPairsRepository: Repository<LiquidityPair>,
    private readonly httpService: HttpService,
    private readonly mapper: LiquidityPairsMapper,
  ) {}

  @Cron(CronExpression.EVERY_3_MINUTES)
  async fetchLiquidityPairs(): Promise<void> {
    this.logger.log('Start downloading liquidity pairs.');

    const { data } = await firstValueFrom(
      this.httpService.get<LiquidityPairDTO[]>(LIQUIDITY_PAIRS_URL),
    );
    const liquidityPairs = this.mapper.toEntities(data);

    this.resolveOrdering(liquidityPairs);

    this.liquidityPairsRepository.upsert(liquidityPairs, {
      conflictPaths: [],
    });

    this.logger.log('Downloading of liquidity pairs was successful!');
  }

  private resolveOrdering(liquidityPairs: LiquidityPair[]) {
    liquidityPairs.sort((a, b) => (a.liquidity < b.liquidity ? 1 : -1));

    liquidityPairs.forEach((liquidityPair, index) => {
      liquidityPair.order = index + 1;
      liquidityPair.updatedAt = new Date();
    });
  }
}
