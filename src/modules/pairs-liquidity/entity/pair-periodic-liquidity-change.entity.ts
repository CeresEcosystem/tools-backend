import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pairs_periodic_liquidity_change')
export class PairPeriodicLiquidityChangeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'base_asset_symbol' })
  baseAssetSymbol: string;

  @Column({ name: 'base_asset_name' })
  baseAssetName: string;

  @Column({ name: 'base_asset_id' })
  baseAssetId: string;

  @Column({ name: 'token_asset_name' })
  tokenAssetName: string;

  @Column({ name: 'token_asset_symbol' })
  tokenAssetSymbol: string;

  @Column({ name: 'token_asset_id' })
  tokenAssetId: string;

  @Column({ name: 'liquidity' })
  liquidity: number;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
