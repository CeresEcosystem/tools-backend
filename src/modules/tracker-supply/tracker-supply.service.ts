import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getTodayFormatted } from 'src/utils/date-utils';
import { Repository } from 'typeorm';
import { TrackerSupply } from './tracker-supply.entity';

@Injectable()
export class TrackerSupplyService {
  private readonly logger = new Logger(TrackerSupplyService.name);

  constructor(
    @InjectRepository(TrackerSupply)
    private readonly trackerSupplyRepository: Repository<TrackerSupply>,
  ) {}

  async save(trackerSupply: string): Promise<void> {
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
}
