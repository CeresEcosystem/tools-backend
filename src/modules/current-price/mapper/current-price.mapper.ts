import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { CurrentPriceBcDto } from '../dto/current-price-bc.dto';
import { CurrentPrice } from '../entity/current-price.entity';

export class CurrentPriceBcDtoToEntityMapper extends BaseEntityMapper<
  CurrentPrice,
  CurrentPriceBcDto
> {
  toEntity(dto: CurrentPriceBcDto): CurrentPrice {
    return {
      token: dto.token,
      price: dto.price,
      assetId: dto.asset_id,
      fullName: dto.full_name,
      deleted: false,
    } as CurrentPrice;
  }
}
