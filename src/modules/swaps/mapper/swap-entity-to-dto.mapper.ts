import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { Swap } from '../entity/swaps.entity';
import { SwapDto } from '../dto/swap.dto';

export class SwapEntityToDto extends BaseDtoMapper<Swap, SwapDto> {
  toDto(entity: Swap): SwapDto {
    const {
      id,
      swappedAt,
      accountId,
      inputAssetId,
      outputAssetId,
      assetInputAmount,
      assetOutputAmount,
    } = entity;

    return {
      id,
      swappedAt,
      accountId,
      inputAssetId,
      outputAssetId,
      assetInputAmount,
      assetOutputAmount,
    };
  }
}
