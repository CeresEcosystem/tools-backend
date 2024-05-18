import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type AggResolution = '5m' | '15m' | '30m' | '60m' | '1D';

@Entity('prices_agg')
@Index(['token', 'periodEpoch', 'resolution'], { unique: true })
export class ChronoPriceAgg {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  resolution: AggResolution;

  @Column('timestamp', { name: 'period_date' })
  periodDate: Date;

  @Column({ name: 'period_epoch', type: 'bigint' })
  periodEpoch: string;

  @Column('float')
  open: number;

  @Column('float')
  close: number;

  @Column('float')
  high: number;

  @Column('float')
  low: number;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
