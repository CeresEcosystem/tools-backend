import { BaseDtoMapper } from 'src/utils/mappers/base-dto-mapper';
import { Transfer } from '../entity/transfer.entity';
import { TransferDto } from '../dto/transfer.dto';

export class TransferEntityToDto extends BaseDtoMapper<Transfer, TransferDto> {
  override toDto(entity: Transfer): TransferDto {
    const {
      senderAccountId: sender,
      asset,
      amount,
      receiverAccountId: receiver,
      transferedAt,
      block,
    } = entity;

    return {
      sender,
      amount,
      asset,
      receiver,
      transferedAt,
      block,
    };
  }
}
