import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getTodayFormatted } from 'src/utils/date-utils';
import { Repository } from 'typeorm';
import {
  TrackerBurnDto,
  TrackerBurningGraphPointDto,
  TrackerDto,
  TrackerSupplyGraphPointDto,
} from './dto/tracker.dto';
import { BurnType, Tracker } from './entity/tracker.entity';
import { TrackerToBlockDtoMapper } from './mapper/tracker-to-block-dto.mapper';
import { TrackerSupplyRepository } from './tracker-supply.repository';
import { SoraClient } from '../sora-client/sora-client';

const BURN_PERIODS = [
  { type: '-1' }, // Total
  { type: '24', lookBack: 14400 }, // Last 24 hours
  { type: '7', lookBack: 100800 }, // Last 7 days
  { type: '30', lookBack: 432000 }, // Last 30 days
];

@Injectable()
export class TrackerService {
  constructor(
    @InjectRepository(Tracker)
    private readonly trackerRepository: Repository<Tracker>,
    private readonly trackerSupplyRepository: TrackerSupplyRepository,
    private readonly trackerToBlockMapper: TrackerToBlockDtoMapper,
    private readonly soraClient: SoraClient,
  ) {}

  public async findLastBlockNumber(
    token: string,
    burnType: BurnType,
  ): Promise<number> {
    const { lastBlock } = await this.trackerRepository
      .createQueryBuilder()
      .select('MAX(block_num)', 'lastBlock')
      .where({ token, burnType })
      .getRawOne<{ lastBlock: string }>();

    return Number(lastBlock);
  }

  public async getTrackerData(token: string): Promise<TrackerDto> {
    const blocks = await this.getAll(token);
    const currentBlock = await this.getCurrentBlock();
    const lastBlock = blocks[0]?.blockNum || 0;

    return {
      blocks: this.trackerToBlockMapper.toDtos(blocks),
      last: lastBlock,
      burn: this.calculateBurningData(blocks, currentBlock),
      graphBurning: await this.getBurningGraphData(token),
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

  private getAll(token: string): Promise<Tracker[]> {
    return this.trackerRepository.find({
      where: { token },
      order: { blockNum: 'DESC' },
    });
  }

  private calculateBurningData(
    blocks: Tracker[],
    currentBlock: number,
  ): Map<string, TrackerBurnDto> {
    const burn = new Map<string, TrackerBurnDto>();

    BURN_PERIODS.forEach((period) => {
      burn[period.type] = {
        gross: this.calculateBurn(
          blocks,
          'grossBurn',
          currentBlock,
          period.lookBack,
        ),
        net: this.calculateBurn(
          blocks,
          'netBurn',
          currentBlock,
          period.lookBack,
        ),
      };
    });

    return burn;
  }

  private calculateBurn(
    blocks: Tracker[],
    burnField: 'grossBurn' | 'netBurn',
    currentBlock: number,
    lookBack?: number,
  ): number {
    return blocks
      .filter((block) =>
        (lookBack ? block.blockNum >= currentBlock - lookBack : true),
      )
      .map((block) => Number(block[burnField]))
      .filter((burned) => burned > 0)
      .reduce((partialSum, burned) => partialSum + burned, 0);
  }

  private getBurningGraphData(
    token: string,
  ): Promise<TrackerBurningGraphPointDto[]> {
    const initBlock = this.getBurningGraphInitBlock(token);

    return this.trackerRepository.query(
      `SELECT DATE_FORMAT(date_raw, '%Y-%m-%d') as x,
            SUM(gross_burn) as y,
            SUM(xor_spent) as spent,
            SUM(reminted_lp) as lp,
            SUM(reminted_parliament) as parl,
            SUM(IF(net_burn <= 0, 0, net_burn)) as net,
            SUM(xor_dedicated_for_buy_back) as back
            FROM tracker
            WHERE date_raw is not null
            AND token = ?
            AND block_num > ?
            GROUP BY date_raw
            ORDER BY date_raw`,
      [token, initBlock],
    );
  }

  private getBurningGraphInitBlock(token: string): string {
    switch (token) {
      case 'VAL':
        return '1243341'; // Burning mechanism was upgraded starting with this block
      default:
        return '0';
    }
  }

  private async getCurrentBlock(): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();
    const blockNumber = await soraApi.query.system.number();

    return blockNumber.toNumber();
  }
}
