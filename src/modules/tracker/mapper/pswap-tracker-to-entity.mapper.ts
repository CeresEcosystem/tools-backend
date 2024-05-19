import { BaseEntityMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { BurnType, Tracker } from '../entity/tracker.entity';

export class PSWAPTrackerBlockBcToEntityMapper extends BaseEntityMapper<
  Tracker,
  string
> {
  toEntity(trackerRow: string): Tracker {
    const parts = trackerRow.split(',');

    return {
      token: 'PSWAP',
      burnType: BurnType.FEES,
      blockNum: Number(parts[0]),
      xorSpent: Number(parts[1]),
      grossBurn: Number(parts[2]),
      remintedLp: Number(parts[3]),
      remintedParliament: Number(parts[4]),
      netBurn: Number(parts[5]),
    } as Tracker;
  }
}
