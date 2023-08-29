import { SymbolAdminDto } from '../dto/symbol-admin-dto';
import { TokenSymbol } from '../entity/symbol.entity';
import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';

export class SymbolsAdminMapper extends BaseDtoMapper<
  TokenSymbol,
  SymbolAdminDto
> {
  toDto(entity: TokenSymbol): SymbolAdminDto {
    const {
      id,
      description,
      minMovement1,
      minMovement2,
      priceScale,
      hasIntraday,
      hasNoVolume,
    } = entity;

    return {
      id,
      description,
      minMovement1,
      minMovement2,
      priceScale,
      hasIntraday,
      hasNoVolume,
    };
  }
}
