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

  findUser(deviceId) {
    return this.userDeviceRepo.findOne({
      where: {
        deviceId: deviceId,
      },
      relations: ['tokens'],
    });
  }

  saveUser(newUser) {
    return this.userDeviceRepo.save(newUser);
  }
}
