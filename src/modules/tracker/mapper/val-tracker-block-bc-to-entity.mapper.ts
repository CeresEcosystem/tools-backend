import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { Tracker } from '../entity/tracker.entity';
import { ValTrackerBlockDto } from '../dto/val-tracker-bc-block';
import { Big } from 'big.js';

export class VALTrackerBlockBcToEntityMapper extends BaseEntityMapper<
  Tracker,
  ValTrackerBlockDto
> {
  toEntity(burningData: ValTrackerBlockDto): Tracker {
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
