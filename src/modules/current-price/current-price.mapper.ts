import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import { CurrentPriceDTO } from './dto/current-price.dto';
import { CurrentPrice } from './entity/current-price.entity';

export class CurrentPriceMapper extends BaseEntityMapper<
  CurrentPrice,
  CurrentPriceDTO
> {
  toEntity(dto: CurrentPriceDTO): CurrentPrice {
    return {
      token: dto.token,
      price: dto.price,
      assetId: dto.asset_id,
      fullName: dto.full_name,
      deleted: false,
    } as CurrentPrice;
  }
}
