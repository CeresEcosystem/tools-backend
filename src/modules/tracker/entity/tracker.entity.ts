import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity(`tracker`)
export class Tracker {
  @PrimaryColumn({ name: 'id' })
  id: number;

  @Column({ name: 'block_num' })
  blockNum: number;

  @Column({ name: 'xor_spent' })
  xorSpent: string;

  @Column({ name: 'pswap_gross_burn' })
  pswapGrossBurn: string;

  @Column({ name: 'pswap_net_burn' })
  pswapNetBurn: string;

  @Column({ name: 'pswap_reminted_lp' })
  pswapRemintedLp: string;

  @Column({ name: 'pswap_reminted_parliament' })
  pswapRemintedParliament: string;

  @Column(`timestamp`, { name: `created_at` })
  createdAt: Date;

  @Column(`timestamp`, { name: `updated_at` })
  updatedAt: Date;

  @Column(`date`, { name: 'date_raw' })
  dateRaw: string;
}
