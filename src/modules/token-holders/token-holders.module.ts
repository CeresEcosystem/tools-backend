import { Module } from '@nestjs/common';
import { SoraClientModule } from '../sora-client/sora-client-module';
import { TokenHoldersController } from './token-holders.controller';
import { TokenHoldersService } from './token-holders.service';
import { RelevantPricesModule } from '../notification-relevant-prices/relevant-prices.module';
import { HoldersRepository } from './holders.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holder } from './entity/holders.entity';
import { HolderEntityToDto } from './mapper/holder-entity-to-dto.mapper';
import { ConfigModule } from '@nestjs/config';

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
