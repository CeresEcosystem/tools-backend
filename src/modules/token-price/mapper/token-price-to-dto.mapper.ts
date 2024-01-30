import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { TokenPrice } from '../entity/token-price.entity';
import { TokenPriceDto } from '../dto/token-price.dto';
import Big from 'big.js';

export class TokenPriceToDtoMapper extends BaseDtoMapper<
  TokenPrice,
  TokenPriceDto
> {
  toDto(entity: TokenPrice): TokenPriceDto {
    const {
      token,
      price,
      marketCap,
      assetId,
      fullName,
      lockedTokens,
      updatedAt,
    } = entity;

    return {
      token,
      price: new Big(price).toFixed(),
      assetId,
      marketCap,
      fullName,
      lockedTokens,
      updatedAt,
    };
  }
}
