import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TransferDirection {
  BURNED = 'burned',
  MINTED = 'minted',
}

@Entity('transfer')
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

  @Column('timestamp', { name: 'transferred_at' })
  transferredAt: Date;

  @Column({ name: 'block' })
  block: number;

  @Column({ name: 'type' })
  type: string;

  @Column({ name: 'direction', type: 'enum', enum: TransferDirection })
  direction: TransferDirection;
}
