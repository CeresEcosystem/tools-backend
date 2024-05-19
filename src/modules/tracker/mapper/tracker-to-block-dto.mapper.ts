import { Tracker } from '../entity/tracker.entity';
import { TrackerBlockDto } from '../dto/tracker.dto';
import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

export class TrackerToBlockDtoMapper extends BaseDtoMapper<
  Tracker,
  TrackerBlockDto
> {
  toDto(entity: Tracker): TrackerBlockDto {
    const {
      blockNum,
      burnType,
      grossBurn,
      netBurn,
      remintedLp,
      remintedParliament,
      xorSpent,
      xorDedicatedForBuyBack,
    } = entity;

    return {
      blockNum,
      burnType,
      grossBurn,
      netBurn,
      remintedLp,
      remintedParliament,
      xorSpent,
      xorDedicatedForBuyBack,
    };
  }
}
