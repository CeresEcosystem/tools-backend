import {
  PairLiquidityChangeEntity,
  TransactionType,
} from '../entity/pair-liquidity-change.entity';
import { PairLiquidityChangeDataDto } from '../dto/pair-liquidity-change-data.dto';
import { BaseEntityMapper } from 'src/utils/mappers/base-entity-mapper';
import Big from 'big.js';

export class PairLiquidityChangeDataDtoToEntityMapper extends BaseEntityMapper<
  PairLiquidityChangeEntity,
  PairLiquidityChangeDataDto
> {
  toEntity(dto: PairLiquidityChangeDataDto): PairLiquidityChangeEntity {
    const { transactionType, signerId, blockNumber, timestamp } = dto;

    switch (transactionType) {
      case TransactionType.DEPOSIT:
        return {
          signerId,
          blockNumber,
          firstAssetId: dto.eventArgs[1].code.toString(),
          secondAssetId: dto.eventArgs[2].code.toString(),
          firstAssetAmount: Big(dto.eventArgs[3]).toString(),
          secondAssetAmount: Big(dto.eventArgs[4]).toString(),
          timestamp,
          transactionType,
        };
      case TransactionType.WITHDRAW:
        return {
          signerId,
          blockNumber,
          firstAssetId: dto.eventArgs[1].code.toString(),
          secondAssetId: dto.eventArgs[2].code.toString(),
          firstAssetAmount: Big(dto.eventArgs[4]).toString(),
          secondAssetAmount: Big(dto.eventArgs[5]).toString(),
          timestamp,
          transactionType,
        };
      default:
        throw new Error(`Unsupported transaction type: ${transactionType}`);
    }
  }
}
