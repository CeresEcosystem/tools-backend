import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('currency_rate')
export class CurrencyRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'currency', length: 3, unique: true })
  currency: string;

  @Column('float', { name: 'rate' })
  rate: number;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
