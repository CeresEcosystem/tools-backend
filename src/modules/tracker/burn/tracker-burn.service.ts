import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Not, QueryFailedError, Repository } from 'typeorm';
import { Tracker } from './entity/tracker.entity';
import { TrackerBurn } from './entity/tracker-burn.entity';
import { TRACKED_TOKENS } from '../tracker.constants';
import { plainToInstance } from 'class-transformer';
import { TrackerBurningGraphPointDto } from './dto/tracker-block.dto';
import { IS_WORKER_INSTANCE } from 'src/constants/constants';

@Injectable()
export class TrackerBurnService {
  private readonly logger = new Logger(TrackerBurnService.name);

  constructor(
    @InjectRepository(Tracker)
    private readonly trackerRepository: Repository<Tracker>,
    @InjectRepository(TrackerBurn)
    private readonly trackerBurnRepository: Repository<TrackerBurn>,
  ) {
    if (IS_WORKER_INSTANCE) {
      TRACKED_TOKENS.forEach((token) => this.cacheBurningChartData(token));
    }
  }

  public async getBurningChartData(
    token: string,
  ): Promise<TrackerBurningGraphPointDto[]> {
    const burns = await this.trackerBurnRepository.find({
      where: { token },
      order: { dateRaw: 'ASC' },
    });

    return plainToInstance(TrackerBurningGraphPointDto, burns, {
      excludeExtraneousValues: true,
    });
  }

  public async cacheBurningChartData(token: string): Promise<void> {
    const start = Date.now();
    this.logger.log(`Caching burning chart data for ${token}`);

    const burningDataAggregated = await this.aggregateBurningGraphData(token);

    await this.trackerBurnRepository
      .upsert(burningDataAggregated, ['token', 'dateRaw'])
      .catch((error: QueryFailedError) => {
        this.logger.error(error.message, error.stack);
      });

    const end = Date.now();
    this.logger.log(
      `Finished caching burning chart data for ${token}, duration ${
        end - start
      } milliseconds`,
    );
  }

  private aggregateBurningGraphData(token: string): Promise<Tracker[]> {
    const initBlock = this.getBurningGraphInitBlock(token);

    return this.trackerRepository
      .createQueryBuilder()
      .select('token')
      .addSelect('date_raw', 'dateRaw')
      .addSelect('SUM(gross_burn)', 'grossBurn')
      .addSelect('SUM(xor_spent)', 'xorSpent')
      .addSelect('SUM(reminted_lp)', 'remintedLp')
      .addSelect('SUM(reminted_parliament)', 'remintedParliament')
      .addSelect('SUM(net_burn)', 'netBurn')
      .addSelect('SUM(xor_dedicated_for_buy_back)', 'xorDedicatedForBuyBack')
      .where({
        token,
        dateRaw: Not(IsNull()),
        blockNum: MoreThan(initBlock),
      })
      .groupBy('date_raw')
      .orderBy('date_raw')
      .printSql()
      .getRawMany<Tracker>();
  }

  private getBurningGraphInitBlock(token: string): number {
    switch (token) {
      case 'VAL':
        return 1243341; // Burning mechanism was upgraded starting with this block
      default:
        return 0;
    }
  }
}
