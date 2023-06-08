import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { TrackerBlockDto } from '../dto/tracker-block.dto';
import { Tracker } from '../entity/tracker.entity';

export class TrackerToBlockDtoMapper extends BaseDtoMapper<
  Tracker,
  TrackerBlockDto
> {
  toDto(entity: Tracker): TrackerBlockDto {
    const {
      blockNum,
      grossBurn,
      netBurn,
      remintedLp,
      remintedParliament,
      xorSpent,
      xorDedicatedForBuyBack,
    } = entity;

    return {
      blockNum,
      grossBurn,
      netBurn,
      remintedLp,
      remintedParliament,
      xorSpent,
      xorDedicatedForBuyBack,
    };
  }
}
