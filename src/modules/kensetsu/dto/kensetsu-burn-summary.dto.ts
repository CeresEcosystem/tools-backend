import { Expose } from 'class-transformer';

export class KensetsuBurnSummaryDto {
  @Expose()
  amountBurnedTotal: number;
}
