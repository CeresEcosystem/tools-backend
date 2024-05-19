import { Holder } from '../entity/holders.entity';
import { HolderDto } from '../dto/holder.dto';
import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

export class HolderEntityToDto extends BaseDtoMapper<Holder, HolderDto> {
  toDto(entity: Holder): HolderDto {
    const { holder, balance } = entity;

    return {
      holder,
      balance,
    };
  }
}
