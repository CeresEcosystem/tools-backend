import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('pairs_volume_changes')
export class PairsVolumeChangeEntity {
  @PrimaryColumn({ name: 'id' })
  id: number;

  @Column({ name: 'token_asset_id' })
  tokenAssetId: string;

  @Column({ name: 'base_asset_id' })
  baseAssetId: string;

  @Column({ name: 'volume' })
  volume: number;

  @Column('timestamp', { name: 'timestamp' })
  timestamp: Date;
}
