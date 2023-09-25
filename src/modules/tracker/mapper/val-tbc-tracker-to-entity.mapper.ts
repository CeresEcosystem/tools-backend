import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { Tracker } from '../entity/tracker.entity';
import { ValTbcTrackerBlockDto } from '../dto/val-tbc-tracker-bc-block';

export class ValTbcTrackerToEntityMapper extends BaseEntityMapper<
  Tracker,
  ValTbcTrackerBlockDto
> {
  toEntity(burningData: ValTbcTrackerBlockDto): Tracker {
    const { dateRaw, blockNum, valBurned } = burningData;

    return {
      token: 'VAL',
      burnType: 'TBC',
      dateRaw,
      blockNum,
      grossBurn: valBurned,
    } as Tracker;
  }
}
