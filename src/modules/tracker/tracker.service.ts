import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TrackerBlockDto,
  TrackerSupplyGraphPointDto,
  TrackerV2Dto,
} from './dto/tracker.dto';
import { BurnType, Tracker } from './entity/tracker.entity';
import { TrackerSupplyRepository } from './tracker-supply.repository';
import { TrackerBurnService } from './tracker-burn.service';
import { TrackerSummaryService } from './tracker-summary.service';
import {
  PageOptionsDto,
  PageDto,
  PageMetaDto,
  getTodayFormatted,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TrackerService {
  constructor(
    private readonly trackerBurnService: TrackerBurnService,
    private readonly trackerSummaryService: TrackerSummaryService,
    @InjectRepository(Tracker)
    private readonly trackerRepository: Repository<Tracker>,
    private readonly trackerSupplyRepository: TrackerSupplyRepository,
  ) {}

  public async findLastBlockNumber(
    token: string,
    burnType?: BurnType,
  ): Promise<number> {
    const queryBuilder = this.trackerRepository
      .createQueryBuilder()
      .select('MAX(block_num)', 'lastBlock')
      .where({ token });

    if (burnType) {
      queryBuilder.andWhere({ burnType });
    }

    const { lastBlock } = await queryBuilder
      .printSql()
      .getRawOne<{ lastBlock: string }>();

    return Number(lastBlock);
  }

  public async getTrackerDataV2(token: string): Promise<TrackerV2Dto> {
    const firstPage = new PageOptionsDto(1, 5);

    return {
      blocksFees: await this.findAll(token, BurnType.FEES, firstPage),
      blocksTbc: await this.findAll(token, BurnType.TBC, firstPage),
      last: await this.findLastBlockNumber(token),
      burn: await this.trackerSummaryService.getBurningSummaryData(token),
      graphBurning: await this.trackerBurnService.getBurningChartData(token),
      graphSupply: await this.trackerSupplyRepository.getSupplyGraphData(token),
    };
  }

  public getTokenSupplyData(
    token: string,
  ): Promise<TrackerSupplyGraphPointDto[]> {
    return this.trackerSupplyRepository.getSupplyGraphData(token);
  }

  public async upsert(trackers: Tracker[]): Promise<void> {
    trackers.forEach((tracker) => {
      tracker.createdAt = new Date();
      tracker.updatedAt = new Date();
      tracker.dateRaw = tracker.dateRaw || getTodayFormatted();
    });

    await this.trackerRepository.upsert(trackers, [
      'token',
      'blockNum',
      'burnType',
    ]);
  }

  public async findAll(
    token: string,
    burnType: BurnType,
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<TrackerBlockDto>> {
    const [data, totalCount] = await this.trackerRepository.findAndCount({
      skip: pageOptions.skip,
      take: pageOptions.size,
      where: { token, burnType },
      order: { blockNum: 'DESC' },
    });

    const pageMeta = new PageMetaDto(
      pageOptions.page,
      pageOptions.size,
      totalCount,
    );

    const dtos = plainToInstance(TrackerBlockDto, data, {
      excludeExtraneousValues: true,
    });

    return new PageDto(dtos, pageMeta);
  }
}
