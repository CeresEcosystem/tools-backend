import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    const today = new Date().toISOString().slice(0, 10);

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

    this.trackerSupplyRepository.update(
      { dateRaw: today },
      {
        supply: trackerSupply,
        updatedAt: new Date(),
      },
    );
  }
}
