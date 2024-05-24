import { Expose } from 'class-transformer';

export class ReservesHistoryDto {
  @Expose()
  tokenName: string;

  @Expose()
  tokenSymbol: string;

  @Expose()
  balance: string;

  @Expose()
  value: number;

  @Expose()
  updatedAt: Date;
}
