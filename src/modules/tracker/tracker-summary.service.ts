import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, QueryFailedError, Repository } from 'typeorm';
import { Tracker } from './entity/tracker.entity';
import { TrackerBurnDto } from './dto/tracker.dto';
import { SummaryPeriod, TrackerSummary } from './entity/tracker-summary.entity';
import { SoraClient } from '../sora-client/sora-client';
import { TRACKED_TOKENS } from './tracker.constants';

const SUMMARY_PERIODS = [
  { type: SummaryPeriod.DAY, lookBack: 14_400 }, // Last 24 hours
  { type: SummaryPeriod.WEEK, lookBack: 100_800 }, // Last 7 days
  { type: SummaryPeriod.MONTH, lookBack: 432_000 }, // Last 30 days
  { type: SummaryPeriod.ALL }, // Total
];

@Injectable()
export class TrackerSummaryService {
  private readonly logger = new Logger(TrackerSummaryService.name);

  constructor(
    @InjectRepository(Tracker)
    private readonly trackerRepository: Repository<Tracker>,
    @InjectRepository(TrackerSummary)
    private readonly trackerSummaryRepository: Repository<TrackerSummary>,
    private readonly soraClient: SoraClient,
  ) {
    TRACKED_TOKENS.forEach((token) => this.cacheBurningSummaryData(token));
  }

  public async getBurningSummaryData(
    token: string,
  ): Promise<Map<SummaryPeriod, TrackerBurnDto>> {
    const summary = await this.trackerSummaryRepository.find({
      where: { token },
    });

    const summaryPerPeriod = new Map<SummaryPeriod, TrackerBurnDto>();

    summary.forEach((sum) => {
      summaryPerPeriod[sum.period] = {
        gross: sum.grossBurn,
        net: sum.netBurn,
      };
    });

    return summaryPerPeriod;
  }

  public async cacheBurningSummaryData(token: string): Promise<void> {
    const start = Date.now();
    this.logger.log(`Caching burning summary data for ${token}`);

    const burningSummary = await this.aggregateBurningSummaryData(token);

    await this.trackerSummaryRepository
      .upsert(burningSummary, ['token', 'period'])
      .catch((error: QueryFailedError) => {
        this.logger.error(error.message, error.stack);
      });

    const end = Date.now();
    this.logger.log(
      `Finished caching burning summary data for ${token}, duration ${
        end - start
      } milliseconds`,
    );
  }

  private async aggregateBurningSummaryData(
    token: string,
  ): Promise<TrackerSummary[]> {
    const currentBlock = await this.getCurrentSoraBlock();

    return Promise.all(
      SUMMARY_PERIODS.map(async (period) => {
        const summaryForPeriod = await this.aggregateBurningSummaryForPeriod(
          token,
          currentBlock,
          period.lookBack,
        );

        return {
          token,
          period: period.type,
          grossBurn: summaryForPeriod.gross,
          netBurn: summaryForPeriod.net,
        } as TrackerSummary;
      }),
    );
  }

  private async aggregateBurningSummaryForPeriod(
    token: string,
    currentBlock: number,
    lookBack?: number,
  ): Promise<{ gross: number; net: number }> {
    const queryBuilder = this.trackerRepository
      .createQueryBuilder()
      .select('SUM(gross_burn)', 'gross')
      .addSelect('SUM(net_burn)', 'net')
      .where({ token });

    if (lookBack) {
      queryBuilder.andWhere({
        blockNum: MoreThan(currentBlock - lookBack),
      });
    }

    const summaryForPeriod = await queryBuilder.getRawOne<{
      gross: number;
      net: number;
    }>();

    return summaryForPeriod;
  }

  private async getCurrentSoraBlock(): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();
    const blockNumber = await soraApi.query.system.number();

    return blockNumber.toNumber();
  }
}
