import { Module } from '@nestjs/common';
import { TokenHoldersController } from './token-holders.controller';
import { TokenHoldersService } from './token-holders.service';
import { RelevantPricesModule } from '../notification-relevant-prices/relevant-prices.module';
import { HoldersRepository } from './holders.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holder } from './entity/holders.entity';
import { HolderEntityToDto } from './mapper/holder-entity-to-dto.mapper';
import { ConfigModule } from '@nestjs/config';
import { SoraClientModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [
    SoraClientModule,
    RelevantPricesModule,
    TypeOrmModule.forFeature([Holder]),
    ConfigModule.forRoot(),
  ],
  controllers: [TokenHoldersController],
  providers: [TokenHoldersService, HoldersRepository, HolderEntityToDto],
})
export class TokenHoldersModule {}
