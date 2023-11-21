import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('relevant_prices')
export class RelevantPrices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'token' })
  token: string;

  @Column({ name: 'asset_id' })
  assetId: string;

  @Column('float', { name: 'token_price' })
  tokenPrice: number;
}
