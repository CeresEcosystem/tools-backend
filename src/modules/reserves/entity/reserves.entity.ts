import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reserves')
export class Reserve {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'token_name' })
  tokenName: string;

  @Index()
  @Column({ name: 'token_symbol' })
  tokenSymbol: string;

  @Column({ name: 'balance', type: 'bigint' })
  balance: string;

  @Column('float', { name: 'value' })
  value: number;

  @Index()
  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
