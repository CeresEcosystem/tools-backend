import { Expose } from 'class-transformer';

export class TokenBurnSummaryDto {
  @Expose()
  amountBurnedTotal: number;
}
