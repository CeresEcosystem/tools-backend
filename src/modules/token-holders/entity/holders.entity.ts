import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('holders')
@Index(['holder', 'assetId'], { unique: true })
@Index('updatedAt')
export class Holder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'holder', length: 50 })
  holder: string;

  @Column({ name: 'asset_id', length: 70 })
  assetId: string;

  @Column('float', { name: 'balance' })
  balance: number;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
