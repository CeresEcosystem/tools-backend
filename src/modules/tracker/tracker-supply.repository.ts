import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getTodayFormatted } from 'src/utils/date-utils';
import { Repository } from 'typeorm';
import { TrackerSupplyGraphPointDto } from './dto/tracker-supply-graph-point.dto';
import { TrackerSupply } from './entity/tracker-supply.entity';

@Injectable()
export class TrackerSupplyRepository {
  private readonly logger = new Logger(TrackerSupplyRepository.name);

  constructor(
    @InjectRepository(TrackerSupply)
    private readonly repository: Repository<TrackerSupply>,
  ) {}

  public async save(token: string, trackerSupply: string): Promise<void> {
    const today = getTodayFormatted();

    const existingSupply = await this.repository.findOneBy({
      token,
      dateRaw: today,
    });

    if (!existingSupply) {
      this.repository.insert({
        token,
        dateRaw: today,
        supply: trackerSupply,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return;
    }

    if (existingSupply.supply != trackerSupply) {
      this.repository.update(
        { token, dateRaw: today },
        {
          supply: trackerSupply,
          updatedAt: new Date(),
        },
      );
    }
  }

  public async getSupplyGraphData(
    token: string,
  ): Promise<TrackerSupplyGraphPointDto[]> {
    return this.repository.query(
      `SELECT DATE_FORMAT(date_raw, '%Y-%m-%d') as x, \
            supply as y \
            FROM tracker_supply \
            WHERE token = ? \
            ORDER BY date_raw`,
      [token],
    );
  }
}
