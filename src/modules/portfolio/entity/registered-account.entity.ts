import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('registered_account')
export class RegisteredAccount {
  @PrimaryGeneratedColumn({ name: 'id' })
  id?: number;

  @Column({ name: 'account_id', length: 60, unique: true })
  accountId: string;
}
