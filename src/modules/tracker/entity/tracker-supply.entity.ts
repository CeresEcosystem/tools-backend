import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tracker_supply')
export class TrackerSupply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column('date', { name: 'date_raw' })
  dateRaw: string;

  @Column()
  supply: string;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
