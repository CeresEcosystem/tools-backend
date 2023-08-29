import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('symbols')
export class TokenSymbol {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ name: 'exchange-traded' })
  exchangeTraded: string;

  @Column({ name: 'exchange-listed' })
  exchangeListed: string;

  @Column()
  timezone: string;

  @Column({ name: 'minmovement' })
  minMovement1: number;

  @Column({ name: 'minmovement2' })
  minMovement2: number;

  @Column({ name: 'pricescale' })
  priceScale: number;

  @Column({ name: 'has-intraday' })
  hasIntraday: boolean;

  @Column({ name: 'has-no-volume' })
  hasNoVolume: boolean;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column()
  ticker: string;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
