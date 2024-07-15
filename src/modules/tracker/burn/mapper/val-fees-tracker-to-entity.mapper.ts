import { BurnType, Tracker } from '../entity/tracker.entity';
import { Big } from 'big.js';
import { ValFeesTrackerBlockDto } from '../dto/val-fees-tracker-bc-block';
import { BaseEntityMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

export class ValFeesTrackerBlockBcToEntityMapper extends BaseEntityMapper<
  Tracker,
  ValFeesTrackerBlockDto
> {
  toEntity(burningData: ValFeesTrackerBlockDto): Tracker {
    const {
      dateRaw,
      blockNum,
      xorTotalFee,
      valBurned,
      valRemintedParliament,
      xorDedicatedForBuyBack,
    } = burningData;

    return {
      token: 'VAL',
      burnType: BurnType.FEES,
      dateRaw,
      blockNum,
      xorSpent: Number(xorTotalFee),
      grossBurn: Number(valBurned),
      remintedParliament: Number(valRemintedParliament),
      xorDedicatedForBuyBack: Number(xorDedicatedForBuyBack),
      netBurn: new Big(valBurned).sub(valRemintedParliament).toNumber(),
    } as Tracker;
  }
}
