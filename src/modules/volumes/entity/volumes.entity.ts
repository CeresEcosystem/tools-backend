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

@Entity('volumes')
export class TokenVolume {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  token: string;

  @Column('decimal', {
    precision: 16,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  volume: number;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'volume_at' })
  volumeAt: number;
}
