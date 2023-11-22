import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity(`Transactions`)
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sender_account_id' })
  senderAccId: string;

  @Column({ name: 'asset_id' })
  asset: string;

  @Column('float', { name: 'amount' })
  amount: number;

  @Column({ name: 'receiver_acc_id' })
  receiverAccId: string;
}
