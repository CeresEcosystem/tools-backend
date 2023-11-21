import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getTodayFormatted } from 'src/utils/date-utils';
import { Repository } from 'typeorm';
import { TrackerSupply } from './entity/tracker-supply.entity';
import { TrackerSupplyGraphPointDto } from './dto/tracker.dto';

@Injectable()
export class TrackerSupplyRepository {
  constructor(
    @InjectRepository(TrackerSupply)
    private readonly repository: Repository<TrackerSupply>,
  ) {}

  public async save(
    token: string,
    trackerSupply: string,
    dateFormatted?: string,
  ): Promise<void> {
    const dateRaw = dateFormatted || getTodayFormatted();

    const existingSupply = await this.repository.findOneBy({
      token,
      dateRaw,
    });

    if (!existingSupply) {
      await this.repository.insert({
        token,
        dateRaw,
        supply: trackerSupply,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return;
    }

    if (existingSupply.supply !== trackerSupply) {
      await this.repository.update(
        { token, dateRaw },
        {
          supply: trackerSupply,
          updatedAt: new Date(),
        },
      );
    }
  }

  public getSupplyGraphData(
    token: string,
  ): Promise<TrackerSupplyGraphPointDto[]> {
    return this.repository
      .createQueryBuilder()
      .select("DATE_FORMAT(date_raw, '%Y-%m-%d')", 'x')
      .addSelect('supply', 'y')
      .where({ token })
      .orderBy('date_raw')
      .getRawMany<TrackerSupplyGraphPointDto>();
  }
}
