import { Expose } from 'class-transformer';

export class TokenBurnDto {
  @Expose()
  accountId: string;

  @Expose()
  assetId: string;

  @Expose()
  blockNum: string;

  @Expose()
  amountBurned: number;

  @Expose()
  createdAt: Date;
}
