import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackerBurnDto } from './dto/tracker-burn.dto';
import { TrackerBurningGraphPointDto } from './dto/tracker-burning-graph-point.dto';
import { TrackerDto } from './dto/tracker.dto';
import { Tracker } from './entity/tracker.entity';
import { TrackerToBlockDtoMapper } from './mapper/tracker-to-block-dto.mapper';
import { TrackerSupplyService } from './tracker-supply.service';

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
    private readonly trackerSupplyService: TrackerSupplyService,
    private readonly trackerToBlockMapper: TrackerToBlockDtoMapper,
  ) {}

  public async getTrackerData(): Promise<TrackerDto> {
    const blocks = await this.getAll();
    const lastBlock = blocks[0].blockNum;

    return {
      blocks: this.trackerToBlockMapper.toDtos(blocks),
      last: lastBlock,
      burn: this.calculateBurningData(blocks, lastBlock),
      graphBurning: await this.calculateBurningGraph(),
      graphSupply: await this.trackerSupplyService.calculateSupplyGraph(),
    };
  }

  private getAll(): Promise<Tracker[]> {
    return this.trackerRepository.find({ order: { blockNum: 'DESC' } });
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
          'pswapGrossBurn',
          lastBlock,
          period.lookBack,
        ),
        net: this.calculateBurn(
          blocks,
          'pswapNetBurn',
          lastBlock,
          period.lookBack,
        ),
      };
    });

    return burn;
  }

  private calculateBurn(
    blocks: Tracker[],
    burnField: 'pswapGrossBurn' | 'pswapNetBurn',
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

  private async calculateBurningGraph(): Promise<
    TrackerBurningGraphPointDto[]
  > {
    return await this.trackerRepository.query(
      `SELECT DATE_FORMAT(date_raw, '%Y-%m-%d') as x, \
            SUM(pswap_gross_burn) as y, \
            SUM(xor_spent) as spent, \
            SUM(pswap_reminted_lp) as lp, \
            SUM(pswap_reminted_parliament) as parl, \
            SUM(IF(pswap_net_burn <= 0, 0, pswap_net_burn)) AS net \
            FROM tracker \
            WHERE date_raw is not null \
            GROUP BY date_raw \
            ORDER BY date_raw`,
    );
  }
}
