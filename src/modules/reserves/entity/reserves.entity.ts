import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity(`reserve`)
export class Reserve {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'address' })
  address: string;

  @Column({ name: 'token_name' })
  tokenName: string;

  @Column({ name: 'token_symbol' })
  tokenSymbol: string;

  @Column({ name: 'balance' })
  balance: number;

  @Column('float', { name: 'value' })
  value: number;
}
