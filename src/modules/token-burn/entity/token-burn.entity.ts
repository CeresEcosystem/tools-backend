import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm';

class ColumnNumericTransformer implements ValueTransformer {
  to(data: number): number {
    return data;
  }

  from(data: string): number {
    return parseFloat(data);
  }
}

@Entity('token_burn')
export class TokenBurn {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ name: 'asset_id' })
  assetId: string;

  @Column({ name: 'block_num' })
  blockNum: string;

  @Column('decimal', {
    name: 'amount_burned',
    precision: 16,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amountBurned: number;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
