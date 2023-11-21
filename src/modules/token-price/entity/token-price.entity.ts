import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity(`current_price`)
export class TokenPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column('float')
  price: number;

  @Column({ name: 'asset_id' })
  assetId: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  order: number;

  @Column('float', { name: 'locked_tokens', default: 0 })
  lockedTokens: number;

  @Column()
  deleted: boolean;

  @Column(`timestamp`, { name: `updated_at` })
  updatedAt: Date;
}
