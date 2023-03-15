import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { CurrentPrice } from '../../current-price/entity/current-price.entity';
import { CurrentPriceDto } from '../dto/current-price.dto';

export class CurrentPriceToDtoMapper extends BaseDtoMapper<
  CurrentPrice,
  CurrentPriceDto
> {
  toDto(entity: CurrentPrice): CurrentPriceDto {
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
