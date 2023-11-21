import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('token_order')
export class TokenOrder {
  @PrimaryColumn()
  symbol: string;

  @Column()
  order: number;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
