import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('currency_rate')
export class CurrencyRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'currency' })
  currency: string;

  @Column('float', { name: 'rate' })
  rate: number;

  @Column({ name: 'updated_at' })
  updatedAt: Date;
}
