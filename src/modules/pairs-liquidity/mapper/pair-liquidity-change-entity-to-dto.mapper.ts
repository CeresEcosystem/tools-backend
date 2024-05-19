import { PairLiquidityChangeEntity } from '../entity/pair-liquidity-change.entity';
import { PairLiquidityChangeDto } from '../dto/pair-liquidity-change.dto';
import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

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
