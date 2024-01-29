import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { BurnType, Tracker } from '../entity/tracker.entity';
import { ValTbcTrackerBlockDto } from '../dto/val-tbc-tracker-bc-block';

export class ValTbcTrackerToEntityMapper extends BaseEntityMapper<
  Tracker,
  ValTbcTrackerBlockDto
> {
  toEntity(burningData: ValTbcTrackerBlockDto): Tracker {
    const { dateRaw, blockNum, valBurned } = burningData;

    return {
      token: 'VAL',
      burnType: BurnType.TBC,
      dateRaw,
      blockNum,
      grossBurn: Number(valBurned),
      netBurn: Number(valBurned),
    } as Tracker;
  }
}
