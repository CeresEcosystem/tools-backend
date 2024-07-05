import { Transfer } from '../entity/transfer.entity';
import { TransferDto } from '../dto/transfer.dto';
import { BaseDtoMapper } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

export class TransferEntityToDto extends BaseDtoMapper<Transfer, TransferDto> {
  override toDto(entity: Transfer): TransferDto {
    const {
      senderAccountId: sender,
      asset,
      amount,
      receiverAccountId: receiver,
      transferredAt,
      block,
      type,
      direction,
    } = entity;

    return {
      sender,
      amount,
      asset,
      receiver,
      transferredAt,
      block,
      type,
      direction,
    };
  }
}
