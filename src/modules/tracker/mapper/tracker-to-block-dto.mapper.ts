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
      pswapGrossBurn,
      pswapNetBurn,
      pswapRemintedLp,
      pswapRemintedParliament,
      xorSpent,
    } = entity;

    return {
      blockNum,
      pswapGrossBurn,
      pswapNetBurn,
      pswapRemintedLp,
      pswapRemintedParliament,
      xorSpent,
    };
  }
}
