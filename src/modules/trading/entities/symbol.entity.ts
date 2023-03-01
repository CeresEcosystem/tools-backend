import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity(`symbols`)
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

  @Column()
  minmovement: boolean;

  @Column()
  minmovement2: boolean;

  @Column()
  pricescale: number;

  @Column({ name: 'has-dwm' })
  hasDwm: boolean;

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
