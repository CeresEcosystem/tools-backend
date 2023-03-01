import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity(`current_price`)
export class CurrentPrice {
  @PrimaryColumn()
  id: string;

  @Column()
  token: string;

  @Column()
  price: number;

  @Column({ name: 'locked_tokens' })
  lockedTokens: number;

  @Column({ name: 'asset_id' })
  assetId: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  order: number;

  @Column()
  deleted: boolean;

  @Column(`timestamp`, { name: `updated_at` })
  updatedAt: Date;
}
