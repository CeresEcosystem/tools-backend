import { Column, Entity, PrimaryColumn } from 'typeorm';

export type BurnType = 'FEES' | 'TBC';

@Entity('tracker')
export class Tracker {
  @PrimaryColumn()
  id: number;

  @Column()
  token: string;

  @Column({ name: 'block_num' })
  blockNum: number;

  @Column({ name: 'burn_type' })
  burnType: BurnType;

  @Column({ name: 'xor_spent' })
  xorSpent: string;

  @Column({ name: 'gross_burn' })
  grossBurn: string;

  @Column({ name: 'net_burn' })
  netBurn: string;

  @Column({ name: 'reminted_lp' })
  remintedLp: string;

  @Column({ name: 'reminted_parliament' })
  remintedParliament: string;

  @Column({ name: 'xor_dedicated_for_buy_back' })
  xorDedicatedForBuyBack: string;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;

  @Column('date', { name: 'date_raw' })
  dateRaw: string;
}
