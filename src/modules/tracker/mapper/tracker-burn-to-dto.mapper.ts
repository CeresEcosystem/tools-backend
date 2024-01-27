import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { TrackerBurn } from '../entity/tracker-burn.entity';
import { TrackerBurningGraphPointDto } from '../dto/tracker.dto';

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
