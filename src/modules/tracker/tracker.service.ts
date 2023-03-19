import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackerBurningGraphPointDto } from './dto/tracker-burning-graph-point.dto';
import { TrackerDto } from './dto/tracker.dto';
import { Tracker } from './entity/tracker.entity';
import { TrackerToBlockDtoMapper } from './mapper/tracker-to-block-dto.mapper';
import { TrackerSupplyService } from './tracker-supply.service';

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
    const lastBlock = blocks.slice(-1)[0].blockNum;

    return {
      blocks: this.trackerToBlockMapper.toDtos(blocks),
      last: lastBlock,
      burn: this.calculateBurningData(blocks, lastBlock),
      graphBurning: await this.calculateBurningGraph(),
      graphSupply: await this.trackerSupplyService.calculateSupplyGraph(),
    } as TrackerDto;
  }

  private getAll(): Promise<Tracker[]> {
    return this.trackerRepository.find({ order: { blockNum: 'ASC' } });
  }

  private calculateBurningData(blocks: Tracker[], lastBlock: number) {
    const burn = {};

    burn['-1'] = {
      // Total burn
      gross: this.calculateGrossBurn(blocks, lastBlock, lastBlock),
      net: this.calculateNetBurn(blocks, lastBlock, lastBlock),
    };
    burn['24'] = {
      // Last 24 hours
      gross: this.calculateGrossBurn(blocks, lastBlock, 14400),
      net: this.calculateNetBurn(blocks, lastBlock, 14400),
    };
    burn['7'] = {
      // Last 7 days
      gross: this.calculateGrossBurn(blocks, lastBlock, 100800),
      net: this.calculateNetBurn(blocks, lastBlock, 100800),
    };
    burn['30'] = {
      // Last 30 days
      gross: this.calculateGrossBurn(blocks, lastBlock, 432000),
      net: this.calculateNetBurn(blocks, lastBlock, 432000),
    };

    return burn;
  }

  private calculateGrossBurn(
    blocks: Tracker[],
    lastBlock: number,
    lookBack: number,
  ): number {
    return this.calculateBurn(blocks, 'pswapGrossBurn', lastBlock, lookBack);
  }

  private calculateNetBurn(
    blocks: Tracker[],
    lastBlock: number,
    lookBack: number,
  ): number {
    return this.calculateBurn(blocks, 'pswapNetBurn', lastBlock, lookBack);
  }

  private calculateBurn(
    blocks: Tracker[],
    burnField: string,
    lastBlock: number,
    lookBack: number,
  ): number {
    return blocks
      .filter((block) => block.blockNum >= lastBlock - lookBack)
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
