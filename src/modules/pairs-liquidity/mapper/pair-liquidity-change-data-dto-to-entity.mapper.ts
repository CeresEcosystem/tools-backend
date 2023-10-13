import {
  PairLiquidityChangeEntity,
  TransactionType,
} from '../entity/pair-liquidity-change.entity';
import { PairLiquidityChangeDataDto } from '../dto/pair-liquidity-change-data.dto';
import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';

export class PairLiquidityChangeDataDtoToEntityMapper extends BaseEntityMapper<
  PairLiquidityChangeEntity,
  PairLiquidityChangeDataDto
> {
  toEntity(dto: PairLiquidityChangeDataDto): PairLiquidityChangeEntity {
    switch (dto.transactionType) {
      case TransactionType.DEPOSIT:
        return {
          signerId: dto.signerId,
          blockNumber: dto.blockNumber,
          firstAssetId: dto.eventArgs[1].code.toString(),
          secondAssetId: dto.eventArgs[2].code.toString(),
          firstAssetAmount: BigInt(dto.eventArgs[3]).toString(),
          secondAssetAmount: BigInt(dto.eventArgs[4]).toString(),
          timestamp: dto.timestamp,
          transactionType: dto.transactionType,
        };
      case TransactionType.WITHDRAW:
        return {
          signerId: dto.signerId,
          blockNumber: dto.blockNumber,
          firstAssetId: dto.eventArgs[1].code.toString(),
          secondAssetId: dto.eventArgs[2].code.toString(),
          firstAssetAmount: BigInt(dto.eventArgs[4]).toString(),
          secondAssetAmount: BigInt(dto.eventArgs[5]).toString(),
          timestamp: dto.timestamp,
          transactionType: dto.transactionType,
        };
    }
  }
}
