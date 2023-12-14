import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reserves')
export class Reserve {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'token_name' })
  tokenName: string;

  @Column({ name: 'token_symbol' })
  tokenSymbol: string;

  @Column({ name: 'balance' })
  balance: number;

  @Column('float', { name: 'value' })
  value: number;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
