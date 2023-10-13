import { TransactionType } from '../entity/pair-liquidity-change.entity';

export interface PairLiquidityChangeDataDto {
  transactionType: TransactionType;
  signerId: string;
  blockNumber: number;
  timestamp: number;
  eventArgs: any;
}
