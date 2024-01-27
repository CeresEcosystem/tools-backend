import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Not, QueryFailedError, Repository } from 'typeorm';
import { Tracker } from './entity/tracker.entity';
import { TrackerBurn } from './entity/tracker-burn.entity';
import { TrackerBurningGraphPointDto } from './dto/tracker.dto';
import { TrackerBurnToDtoMapper } from './mapper/tracker-burn-to-dto.mapper';

const TRACKED_TOKENS = ['PSWAP', 'VAL'];

@Injectable()
export class TrackerBurnService {
  private readonly logger = new Logger(TrackerBurnService.name);

  constructor(
    @InjectRepository(Tracker)
    private readonly trackerRepository: Repository<Tracker>,
    @InjectRepository(TrackerBurn)
    private readonly trackerBurnRepository: Repository<TrackerBurn>,
    private readonly toDtoMapper: TrackerBurnToDtoMapper,
  ) {
    TRACKED_TOKENS.forEach((token) => this.cacheBurningChartData(token));
  }

  public getBurningChartData(
    token: string,
  ): Promise<TrackerBurningGraphPointDto[]> {
    return this.toDtoMapper.toDtosAsync(
      this.trackerBurnRepository.find({
        where: { token },
        order: { dateRaw: 'ASC' },
      }),
    );
  }

  public async cacheBurningChartData(token: string): Promise<void> {
    const start = Date.now();
    this.logger.log(`Caching burning chart data for ${token}`);

    const burningDataAggregated = await this.getBurningGraphData(token);

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

  private getBurningGraphData(token: string): Promise<Tracker[]> {
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
      .where({ token, dateRaw: Not(IsNull()), blockNum: MoreThan(initBlock) })
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
