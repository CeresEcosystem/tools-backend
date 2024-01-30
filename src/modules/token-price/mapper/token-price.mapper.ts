import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { TokenPriceBcDto } from '../dto/token-price-bc.dto';
import { TokenPrice } from '../entity/token-price.entity';

export class TokenPriceBcDtoToEntityMapper extends BaseEntityMapper<
  TokenPrice,
  TokenPriceBcDto
> {
  toEntity(dto: TokenPriceBcDto): TokenPrice {
    const { symbol, price, assetId, fullName, marketCap } = dto;

    return {
      token: symbol,
      price,
      assetId,
      fullName,
      marketCap,
      deleted: false,
    } as TokenPrice;
  }
}
