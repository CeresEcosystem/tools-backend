import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getTodayFormatted } from 'src/utils/date-utils';
import { Repository } from 'typeorm';
import { TrackerSupplyGraphPointDto } from './dto/tracker-supply-graph-point.dto';
import { TrackerSupply } from './entity/tracker-supply.entity';

@Injectable()
export class TrackerSupplyService {
  private readonly logger = new Logger(TrackerSupplyService.name);

  constructor(
    @InjectRepository(TrackerSupply)
    private readonly trackerSupplyRepository: Repository<TrackerSupply>,
  ) {}

  public async save(trackerSupply: string): Promise<void> {
    const today = getTodayFormatted();

    const existingSupply = await this.trackerSupplyRepository.findOneBy({
      dateRaw: today,
    });

    if (!existingSupply) {
      this.trackerSupplyRepository.insert({
        dateRaw: today,
        supply: trackerSupply,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return;
    }

    if (existingSupply.supply != trackerSupply) {
      this.trackerSupplyRepository.update(
        { dateRaw: today },
        {
          supply: trackerSupply,
          updatedAt: new Date(),
        },
      );
    }
  }

  public async calculateSupplyGraph(): Promise<TrackerSupplyGraphPointDto[]> {
    return this.trackerSupplyRepository.query(
      `SELECT DATE_FORMAT(date_raw, '%Y-%m-%d') as x, \
            supply as y \
            FROM tracker_supply \
            ORDER BY date_raw`,
    );
  }
}
