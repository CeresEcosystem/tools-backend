import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity(`liquidity_pair`)
@Unique(['baseAsset', 'token'])
export class LiquidityPair {
  @PrimaryColumn({ name: 'id' })
  id: number;

  @Column({ name: 'token' })
  token: string;

  @Column({ name: 'token_full_name' })
  tokenFullName: string;

  @Column({ name: 'token_asset_id' })
  tokenAssetId: string;

  @Column({ name: 'base_asset' })
  baseAsset: string;

  @Column({ name: 'base_asset_full_name' })
  baseAssetFullName: string;

  @Column({ name: 'base_asset_id' })
  baseAssetId: string;

  @Column({ name: 'liquidity' })
  liquidity: number;

  @Column({ name: 'base_asset_liq' })
  baseAssetLiquidity: number;

  @Column({ name: 'target_asset_liq' })
  targetAssetLiquidity: number;

  @Column({ name: 'locked_liquidity' })
  lockedLiquidity: number;

  @Column({ name: 'volume' })
  volume: number;

  @Column({ name: 'order' })
  order: number;

  @Column({ name: 'deleted' })
  deleted: boolean;

  @Column(`timestamp`, { name: `updated_at` })
  updatedAt: Date;
}
