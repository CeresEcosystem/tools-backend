import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  ValueTransformer,
} from 'typeorm';

class ColumnNumericTransformer implements ValueTransformer {
  to(data: number): number {
    return data;
  }

  from(data: string): number {
    return parseFloat(data);
  }
}

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

  @Column('decimal', {
    name: 'gross_burn',
    precision: 16,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  grossBurn: number;

  @Column('decimal', {
    name: 'net_burn',
    precision: 16,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  netBurn: number;
}
