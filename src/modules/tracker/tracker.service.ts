import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getTodayFormatted } from 'src/utils/date-utils';
import { Repository } from 'typeorm';
import { TrackerBurnDto } from './dto/tracker-burn.dto';
import { TrackerBurningGraphPointDto } from './dto/tracker-burning-graph-point.dto';
import { TrackerDto } from './dto/tracker.dto';
import { Tracker } from './entity/tracker.entity';
import { TrackerToBlockDtoMapper } from './mapper/tracker-to-block-dto.mapper';
import { TrackerSupplyRepository } from './tracker-supply.repository';

const BURN_PERIODS = [
  { type: '-1' }, // Total
  { type: '24', lookBack: 14400 }, // Last 24 hours
  { type: '7', lookBack: 100800 }, // Last 7 days
  { type: '30', lookBack: 432000 }, // Last 30 days
];

@Injectable()
export class TrackerService {
  private readonly logger = new Logger(TrackerService.name);

  constructor(
    @InjectRepository(Tracker)
    private readonly trackerRepository: Repository<Tracker>,
    private readonly trackerSupplyRepository: TrackerSupplyRepository,
    private readonly trackerToBlockMapper: TrackerToBlockDtoMapper,
  ) {}

  public async findMaxBlockNumber(token: string): Promise<string> {
    const result = await this.trackerRepository
      .createQueryBuilder()
      .select('MAX(block_num)', 'lastBlock')
      .where({ token })
      .getRawOne<{ lastBlock: string }>();

    return result.lastBlock;
  }

  public async getTrackerData(token: string): Promise<TrackerDto> {
    const blocks = await this.getAll(token);
    const lastBlock = blocks[0]?.blockNum || 0;

    return {
      blocks: this.trackerToBlockMapper.toDtos(blocks),
      last: lastBlock,
      burn: this.calculateBurningData(blocks, lastBlock),
      graphBurning: await this.getBurningGraphData(token),
      graphSupply: await this.trackerSupplyRepository.getSupplyGraphData(token),
    };
  }

  public async insert(trackers: Tracker[]): Promise<void> {
    trackers.forEach((tracker) => {
      tracker.createdAt = new Date();
      tracker.updatedAt = new Date();
      tracker.dateRaw = tracker.dateRaw || getTodayFormatted();
    });

    await this.trackerRepository.insert(trackers);
  }

  private getAll(token: string): Promise<Tracker[]> {
    return this.trackerRepository.find({
      where: { token },
      order: { blockNum: 'DESC' },
    });
  }

  private calculateBurningData(
    blocks: Tracker[],
    lastBlock: number,
  ): Map<string, TrackerBurnDto> {
    const burn = new Map<string, TrackerBurnDto>();

    BURN_PERIODS.forEach((period) => {
      burn[period.type] = {
        gross: this.calculateBurn(
          blocks,
          'grossBurn',
          lastBlock,
          period.lookBack,
        ),
        net: this.calculateBurn(blocks, 'netBurn', lastBlock, period.lookBack),
      };
    });

    return burn;
  }

  //FIXME: lookBack should be deducted from the current block
  private calculateBurn(
    blocks: Tracker[],
    burnField: 'grossBurn' | 'netBurn',
    lastBlock: number,
    lookBack?: number,
  ): number {
    return blocks
      .filter((block) =>
        lookBack ? block.blockNum >= lastBlock - lookBack : true,
      )
      .map((block) => Number(block[burnField]))
      .filter((burned) => burned > 0)
      .reduce((partialSum, burned) => partialSum + burned, 0);
  }

  private async getBurningGraphData(
    token: string,
  ): Promise<TrackerBurningGraphPointDto[]> {
    const initBlock = this.getBurningGraphInitBlock(token);

    return await this.trackerRepository.query(
      `SELECT DATE_FORMAT(date_raw, '%Y-%m-%d') as x, \
            SUM(gross_burn) as y, \
            SUM(xor_spent) as spent, \
            SUM(reminted_lp) as lp, \
            SUM(reminted_parliament) as parl, \
            SUM(IF(net_burn <= 0, 0, net_burn)) as net, \
            SUM(xor_dedicated_for_buy_back) as back \
            FROM tracker \
            WHERE date_raw is not null \
            AND token = ? \
            AND block_num > ? \
            GROUP BY date_raw \
            ORDER BY date_raw`,
      [token, initBlock],
    );
  }

  private getBurningGraphInitBlock(token: string) {
    switch (token) {
      case 'VAL':
        return '1243341'; //Burning mechanism was upgraded starting with this block
      default:
        return '0';
    }
  }
}
