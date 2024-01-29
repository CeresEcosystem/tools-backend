import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum BurnType {
  FEES = 'FEES',
  TBC = 'TBC',
}

@Entity('tracker')
export class Tracker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column({ name: 'block_num' })
  blockNum: number;

  @Column('enum', { enum: BurnType, name: 'burn_type' })
  burnType: BurnType;

  @Column('date', { name: 'date_raw' })
  dateRaw: string;

  @Column('float', { name: 'xor_spent' })
  xorSpent: number;

  @Column('float', { name: 'gross_burn' })
  grossBurn: number;

  @Column('float', { name: 'net_burn' })
  netBurn: number;

  @Column('float', { name: 'reminted_lp' })
  remintedLp: number;

  @Column('float', { name: 'reminted_parliament' })
  remintedParliament: number;

  @Column('float', { name: 'xor_dedicated_for_buy_back' })
  xorDedicatedForBuyBack: number;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
