import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum TransactionType {
  DEPOSIT = 'depositLiquidity',
  WITHDRAW = 'withdrawLiquidity',
}

@Entity('pairs_liquidity_changes')
export class PairLiquidityChangeEntity {
  @PrimaryColumn({ name: 'id' })
  id?: number;

  @Column({ name: 'block_number' })
  blockNumber: number;

  @Column({ name: 'signer_id' })
  signerId: string;

  @Column({ name: 'first_asset_id' })
  firstAssetId: string;

  @Column({ name: 'second_asset_id' })
  secondAssetId: string;

  @Column({ name: 'first_asset_amount' })
  firstAssetAmount: string;

  @Column({ name: 'second_asset_amount' })
  secondAssetAmount: string;

  @Column({ type: 'enum', name: 'transaction_type', enum: TransactionType })
  transactionType: TransactionType;

  @Column({ name: 'timestamp' })
  timestamp: number;
}
