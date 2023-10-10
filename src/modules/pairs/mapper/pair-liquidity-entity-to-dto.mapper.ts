import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { PairLiquidityChangeEntity } from '../entity/pair-liquidity-change.entity';
import { PairLiquidityChangeDto } from '../dto/pair-liquidity-chage.dto';

export class PairsLiquidityEntityToDtoMapper extends BaseDtoMapper<
  PairLiquidityChangeEntity,
  PairLiquidityChangeDto
> {
  toDto(entity: PairLiquidityChangeEntity): PairLiquidityChangeDto {
    const {
      id,
      blockNumber,
      signerId,
      firstAssetId,
      secondAssetId,
      firstAssetAmount,
      secondAssetAmount,
      type,
      timestamp,
    } = entity;

    return {
      signerId,
      firstAssetId,
      secondAssetId,
      firstAssetAmount,
      secondAssetAmount,
      type,
      timestamp,
    };
  }
}
