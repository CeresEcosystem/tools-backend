import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { SymbolAdminDto } from '../dto/symbol-admin-dto';
import { TokenSymbol } from '../entity/symbol.entity';

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
