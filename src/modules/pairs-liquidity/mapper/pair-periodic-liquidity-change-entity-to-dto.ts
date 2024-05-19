import { PairPeriodicLiquidityChangeEntity } from '../entity/pair-periodic-liquidity-change.entity';
import { PairPeriodicLiquidityChangeDto } from '../dto/pair-periodic-liquidity-change.dto';
import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

export class PairPeriodicLiquidityChangeEntityToDtoMapper extends BaseDtoMapper<
  PairPeriodicLiquidityChangeEntity,
  PairPeriodicLiquidityChangeDto
> {
  toDto(
    entity: PairPeriodicLiquidityChangeEntity,
  ): PairPeriodicLiquidityChangeDto {
    const {
      baseAssetSymbol,
      tokenAssetSymbol,
      liquidity,
      baseAssetLiq,
      tokenAssetLiq,
      updatedAt,
    } = entity;

    return {
      baseAssetSymbol,
      tokenAssetSymbol,
      liquidity,
      baseAssetLiq,
      tokenAssetLiq,
      updatedAt,
    };
  }
}
