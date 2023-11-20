import { Module } from '@nestjs/common';
import { PriceNotifController } from './price-notif.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDevice } from './entity/user-device.entity';
import { PriceNotifService } from './price-notif.service';
import { TokenPriceModule } from '../token-price/token-price.module';
import { UserDevicesRepository } from './user-device.repository';
import { RelevantPricesModule } from '../notification-relevant-prices/relevant-prices.module';
import { OneSignalModule } from '../one-signal-client/one-signal-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDevice]),
    TokenPriceModule,
    RelevantPricesModule,
    OneSignalModule,
  ],
  controllers: [PriceNotifController],
  providers: [PriceNotifService, UserDevicesRepository],
  exports: [],
})
export class PriceNotifModule {}
