import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity(`transfer`)
export class Transfer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sender_account_id' })
  senderAccountId: string;

  @Column({ name: 'asset_id' })
  asset: string;

  @Column('float', { name: 'amount' })
  amount: number;

  @Column({ name: 'receiver_account_id' })
  receiverAccountId: string;

  @Column('timestamp', { name: 'transfered_at' })
  transferedAt: Date;

  @Column({ name: 'block' })
  block: number;
}
