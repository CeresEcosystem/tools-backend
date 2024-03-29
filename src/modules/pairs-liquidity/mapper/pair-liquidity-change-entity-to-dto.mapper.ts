import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { PairLiquidityChangeEntity } from '../entity/pair-liquidity-change.entity';
import { PairLiquidityChangeDto } from '../dto/pair-liquidity-change.dto';

export class PairLiquidityChangeEntityToDtoMapper extends BaseDtoMapper<
  PairLiquidityChangeEntity,
  PairLiquidityChangeDto
> {
  toDto(entity: PairLiquidityChangeEntity): PairLiquidityChangeDto {
    const {
      signerId,
      firstAssetId,
      secondAssetId,
      firstAssetAmount,
      secondAssetAmount,
      transactionType,
      timestamp,
    } = entity;

    return {
      signerId,
      firstAssetId,
      secondAssetId,
      firstAssetAmount,
      secondAssetAmount,
      transactionType,
      timestamp,
    };
  }
}
