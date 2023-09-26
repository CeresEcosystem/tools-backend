import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { Tracker } from '../entity/tracker.entity';
import { TrackerBlockDto } from '../dto/tracker.dto';

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
