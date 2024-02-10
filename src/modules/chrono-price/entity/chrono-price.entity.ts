import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('prices')
export class ChronoPrice {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  token: string;

  @Column('float')
  price: number;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;
}
