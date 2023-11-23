export interface TransferDto {
  sender: string;
  amount: number;
  asset: string;
  receiver: string;
  transferedAt: Date;
  block: number;
}
