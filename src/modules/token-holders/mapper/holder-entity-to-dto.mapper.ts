import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { Holder } from '../entity/holders.entity';
import { HolderDto } from '../dto/holder.dto';

export class HolderEntityToDto extends BaseDtoMapper<Holder, HolderDto> {
  toDto(entity: Holder): HolderDto {
    const { holder, balance } = entity;

    return {
      holder,
      balance,
    };
  }
}
