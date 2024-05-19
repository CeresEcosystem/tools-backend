import { Reserve } from '../entity/reserves.entity';
import { ReservesHistoryDto } from '../dto/reserves-history.dto';
import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

export class ReserveEntityToDtoMapper extends BaseDtoMapper<
  Reserve,
  ReservesHistoryDto
> {
  toDto(entity: Reserve): ReservesHistoryDto {
    const { tokenName, tokenSymbol, balance, value, updatedAt } = entity;

    return {
      tokenName,
      tokenSymbol,
      balance,
      value,
      updatedAt,
    };
  }
}
