import { BaseDtoMapper } from '../../../utils/mappers/base-dto-mapper';
import { TokenOrderDto } from '../dto/token-order.dto';
import { TokenOrder } from '../entity/token-order.entity';

export class TokenOrderToDtoMapper extends BaseDtoMapper<
  TokenOrder,
  TokenOrderDto
> {
  toDto(entity: TokenOrder): TokenOrderDto {
    const { symbol, order, createdAt, updatedAt } = entity;

    return {
      symbol,
      order,
      createdAt,
      updatedAt,
    };
  }
}
