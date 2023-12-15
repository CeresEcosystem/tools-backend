import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { PairPeriodicLiquidityChangeEntity } from '../entity/pair-periodic-liquidity-change.entity';
import { PairPeriodicLiquidityChangeDto } from '../dto/pair-periodic-liquidity-change.dto';

export class PairPeriodicLiquidityChangeEntityToDtoMapper extends BaseDtoMapper<
  PairPeriodicLiquidityChangeEntity,
  PairPeriodicLiquidityChangeDto
> {
  toDto(
    entity: PairPeriodicLiquidityChangeEntity,
  ): PairPeriodicLiquidityChangeDto {
    const { baseAssetSymbol, tokenAssetSymbol, liquidity, updatedAt } = entity;

    return {
      baseAssetSymbol,
      tokenAssetSymbol,
      liquidity,
      updatedAt,
    };
  }
}
