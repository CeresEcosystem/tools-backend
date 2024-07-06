import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index(['accountId', 'createdAt'])
@Entity('portfolio_value')
export class PortfolioValue {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column('float')
  value: number;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
