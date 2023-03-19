import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity(`tracker_supply`)
export class TrackerSupply {
  @PrimaryColumn({ name: 'id' })
  id: number;

  @Column(`date`, { name: 'date_raw', unique: true })
  dateRaw: string;

  @Column({ name: 'supply' })
  supply: string;

  @Column(`timestamp`, { name: `created_at` })
  createdAt: Date;

  @Column(`timestamp`, { name: `updated_at` })
  updatedAt: Date;
}
