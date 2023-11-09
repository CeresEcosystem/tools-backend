import { Module } from '@nestjs/common';
import { PriceNotifController } from './price-notif.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDevice } from './entity/user-device.entity';
import { PriceNotifService } from './price-notif.service';
import { TokenPriceModule } from '../token-price/token-price.module';
import { UserDevicesRepository } from './user-device.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserDevice]), TokenPriceModule],
  controllers: [PriceNotifController],
  providers: [PriceNotifService, UserDevicesRepository],
  exports: [],
})
export class PriceNotifModule {}
