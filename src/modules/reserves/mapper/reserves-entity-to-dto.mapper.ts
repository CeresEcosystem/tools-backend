import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { Reserve } from '../entity/reserves.entity';
import { ReservesHistoryDto } from '../dto/reserves-history.dto';

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
