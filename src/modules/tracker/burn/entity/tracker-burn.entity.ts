import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('tracker_burn')
@Unique(['token', 'dateRaw'])
export class TrackerBurn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

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
}
