import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum SummaryPeriod {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  ALL = 'ALL',
}

@Entity('tracker_summary')
@Unique('IDX_token_period', ['token', 'period'])
export class TrackerSummary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  token: string;

  @Column('enum', { enum: SummaryPeriod })
  period: SummaryPeriod;

  @Column('float', { name: 'gross_burn' })
  grossBurn: number;

  @Column('float', { name: 'net_burn' })
  netBurn: number;
}
