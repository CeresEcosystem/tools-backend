import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity(`liquidity_pair`)
export class PairsLiquidityChangesEntity {
  @PrimaryColumn({ name: 'id' })
  id: number;

  @Column({ name: 'first_asset_id' })
  firstAssetId: string;

  @Column({ name: 'second_asset_id' })
  secondAssetId: string;

  @Column({ name: 'first_asset_amount' })
  firstAssetAmount: string;

  @Column({ name: 'second_asset_amount' })
  secondAssetAmount: string;

  @Column({ name: 'type' })
  type: string;

  @Column({ name: 'timestamp' })
  timestamp: number;
}
