import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DeviceType } from '../banner-device-type.enum';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  sm: string;

  @Column()
  md: string;

  @Column()
  lg: string;

  @Column()
  link: string;

  @Column()
  title: string;

  @Column('enum', { enum: DeviceType })
  device: DeviceType;

  @Column({ name: 'is_deleted' })
  isDeleted: boolean;

  @Column('timestamp', { name: 'created_at' })
  createdAt: Date;

  @Column('timestamp', { name: 'updated_at' })
  updatedAt: Date;
}
