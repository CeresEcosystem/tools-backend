import { BaseEntityMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { TokenPriceBcDto } from '../dto/token-price-bc.dto';
import { TokenPrice } from '../entity/token-price.entity';

export class TokenPriceBcDtoToEntityMapper extends BaseEntityMapper<
  TokenPrice,
  TokenPriceBcDto
> {
  toEntity(dto: TokenPriceBcDto): TokenPrice {
    const { symbol, price, assetId, fullName } = dto;

    return {
      token: symbol,
      price,
      assetId,
      fullName,
      deleted: false,
    } as TokenPrice;
  }
}
