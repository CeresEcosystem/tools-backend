import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { Transaction } from '../entity/transactions.entity';
import { TransactionDto } from '../dto/transactions.dto';

export class TransactionEntityToDto extends BaseDtoMapper<
  Transaction,
  TransactionDto
> {
  override toDto(entity: Transaction): TransactionDto {
    const {
      senderAccId: sender,
      asset,
      amount,
      receiverAccId: receiver,
    } = entity;

    return {
      sender,
      amount,
      asset,
      receiver,
    };
  }
}
