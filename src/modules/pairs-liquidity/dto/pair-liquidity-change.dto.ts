import { TransactionType } from '../entity/pair-liquidity-change.entity';

export interface PairLiquidityChangeDto {
  signerId: string;
  firstAssetId: string;
  secondAssetId: string;
  firstAssetAmount: string;
  secondAssetAmount: string;
  transactionType: TransactionType;
  timestamp: number;
}
