import { TrackerBurn } from '../entity/tracker-burn.entity';
import { TrackerBurningGraphPointDto } from '../dto/tracker.dto';
import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

export class TrackerBurnToDtoMapper extends BaseDtoMapper<
  TrackerBurn,
  TrackerBurningGraphPointDto
> {
  toDto(entity: TrackerBurn): TrackerBurningGraphPointDto {
    const {
      dateRaw,
      grossBurn,
      netBurn,
      remintedLp,
      remintedParliament,
      xorSpent,
      xorDedicatedForBuyBack,
    } = entity;

    return {
      x: dateRaw,
      y: grossBurn,
      net: netBurn,
      lp: remintedLp,
      parl: remintedParliament,
      spent: xorSpent,
      back: xorDedicatedForBuyBack,
    };
  }
}
