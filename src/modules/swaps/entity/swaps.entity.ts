import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('swap')
@Index(
  [
    'swappedAt',
    'accountId',
    'inputAssetId',
    'outputAssetId',
    'assetInputAmount',
    'assetOutputAmount',
  ],
  { unique: true },
)
export class Swap {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('timestamp', { name: 'swapped_at' })
  swappedAt: Date;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ name: 'input_asset_id' })
  inputAssetId: string;

  @Column({ name: 'output_asset_id' })
  outputAssetId: string;

  @Column('float', { name: 'input_asset_amount' })
  assetInputAmount: number;

  @Column('float', { name: 'output_asset_amount' })
  assetOutputAmount: number;
}
