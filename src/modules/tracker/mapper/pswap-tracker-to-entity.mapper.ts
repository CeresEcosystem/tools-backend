import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { Tracker } from '../entity/tracker.entity';

export class PSWAPTrackerBlockBcToEntityMapper extends BaseEntityMapper<
  Tracker,
  string
> {
  toEntity(trackerRow: string): Tracker {
    const parts = trackerRow.split(',');

    return {
      token: 'PSWAP',
      burnType: 'FEES',
      blockNum: Number(parts[0]),
      xorSpent: parts[1],
      grossBurn: parts[2],
      remintedLp: parts[3],
      remintedParliament: parts[4],
      netBurn: parts[5],
    } as Tracker;
  }
}
