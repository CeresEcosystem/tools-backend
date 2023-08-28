import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity(`tracker_supply`)
export class TrackerSupply {
  @PrimaryColumn()
  id: number;

  @Column()
  token: string;

  @Column(`date`, { name: 'date_raw' })
  dateRaw: string;

  @Column()
  supply: string;

  @Column(`timestamp`, { name: `created_at` })
  createdAt: Date;

  @Column(`timestamp`, { name: `updated_at` })
  updatedAt: Date;
}
