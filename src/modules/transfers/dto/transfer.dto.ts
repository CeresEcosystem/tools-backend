import { TransferDirection } from '../entity/transfer.entity';

export interface TransferDto {
  sender: string;
  amount: number;
  asset: string;
  receiver: string;
  transferredAt: Date;
  block: number;
  type: string;
  direction: TransferDirection;
}
