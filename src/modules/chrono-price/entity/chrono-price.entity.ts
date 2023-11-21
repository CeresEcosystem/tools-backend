import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity(`prices`)
export class ChronoPrice {
  @PrimaryColumn()
  id: string;

  @Column()
  token: string;

  @Column('float')
  price: number;

  @Column(`timestamp`, { name: `created_at` })
  createdAt: Date;
}
