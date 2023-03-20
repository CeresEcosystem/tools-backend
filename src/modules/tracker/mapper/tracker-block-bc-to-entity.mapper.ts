import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { Tracker } from '../entity/tracker.entity';

export class TrackerBlockBcToEntityMapper extends BaseEntityMapper<
  Tracker,
  string
> {
  toEntity(trackerRow: string): Tracker {
    const parts = trackerRow.split(',');

    return {
      blockNum: Number(parts[0]),
      xorSpent: parts[1],
      pswapGrossBurn: parts[2],
      pswapRemintedLp: parts[3],
      pswapRemintedParliament: parts[4],
      pswapNetBurn: parts[5],
    } as Tracker;
  }
}
