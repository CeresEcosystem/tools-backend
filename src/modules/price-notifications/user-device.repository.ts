import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDevice } from './entity/user-device.entity';

@Injectable()
export class UserDevicesRepository {
  constructor(
    @InjectRepository(UserDevice)
    private userDeviceRepo: Repository<UserDevice>,
  ) {}

  findUserByDevice(deviceId: string): Promise<UserDevice> {
    return this.userDeviceRepo.findOne({
      where: {
        deviceId: deviceId,
      },
      relations: ['tokens'],
    });
  }

  findAll(): Promise<UserDevice[]> {
    return this.userDeviceRepo.find({
      relations: ['tokens'],
    });
  }

  saveUser(newUser: UserDevice): Promise<UserDevice> {
    return this.userDeviceRepo.save(newUser);
  }

  deleteUser(user: UserDevice): Promise<UserDevice> {
    return this.userDeviceRepo.remove(user);
  }
}
