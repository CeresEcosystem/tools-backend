import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { TokenPrice } from '../../token-price/entity/token-price.entity';

@Entity('user_device')
export class UserDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'device_id' })
  deviceId: string;

  @ManyToMany(() => TokenPrice)
  @JoinTable({ name: 'device_favorite_tokens' })
  tokens: TokenPrice[];
}
