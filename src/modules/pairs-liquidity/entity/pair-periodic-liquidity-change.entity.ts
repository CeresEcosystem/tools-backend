import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pairs_periodic_liquidity_change')
export class PairPeriodicLiquidityChangeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'base_asset_symbol' })
  baseAssetSymbol: string;

  @Column({ name: 'token_asset_symbol' })
  tokenAssetSymbol: string;

  @Column('float', { name: 'liquidity' })
  liquidity: number;

  @Column('float', { name: 'base_asset_liquidity' })
  baseAssetLiq: number;

  @Column('float', { name: 'token_asset_liquidity' })
  tokenAssetLiq: number;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
