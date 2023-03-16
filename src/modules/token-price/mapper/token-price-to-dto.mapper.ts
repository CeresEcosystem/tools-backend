import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { TokenPrice } from '../entity/token-price.entity';
import { TokenPriceDto } from '../dto/token-price.dto';

export class TokenPriceToDtoMapper extends BaseDtoMapper<
  TokenPrice,
  TokenPriceDto
> {
  toDto(entity: TokenPrice): TokenPriceDto {
    const { token, price, assetId, fullName, lockedTokens, updatedAt } = entity;

    return {
      token,
      price,
      assetId,
      fullName,
      lockedTokens,
      updatedAt,
    };
  }
}
