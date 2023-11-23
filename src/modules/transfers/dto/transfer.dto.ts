export interface TransferDto {
  sender: string;
  amount: number;
  asset: string;
  receiver: string;
  transferredAt: Date;
  block: number;
}
