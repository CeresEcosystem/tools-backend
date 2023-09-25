import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { Tracker } from '../entity/tracker.entity';
import { Big } from 'big.js';
import { ValFeesTrackerBlockDto } from '../dto/val-fees-tracker-bc-block';

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
      burnType: 'FEES',
      dateRaw,
      blockNum,
      xorSpent: xorTotalFee,
      grossBurn: valBurned,
      remintedParliament: valRemintedParliament,
      xorDedicatedForBuyBack,
      netBurn: new Big(valBurned).sub(valRemintedParliament).toString(),
    } as Tracker;
  }
}
