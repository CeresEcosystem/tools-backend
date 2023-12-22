import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('holders')
@Index(['holder', 'token'], { unique: true })
export class Holder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'holder' })
  holder: string;

  @Column({ name: 'token' })
  token: string;

  @Column('float', { name: 'balance' })
  balance: number;
}
