import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersRepository } from './transfers.repository';
import { TransfersListener } from './transfers.listener';
import { TransferEntityToDto } from './mapper/transfer-entity-to-dto.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entity/transfer.entity';
import { TokenPriceModule } from '../token-price/token-price.module';
import { SoraClientModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [
    SoraClientModule,
    TokenPriceModule,
    TypeOrmModule.forFeature([Transfer]),
  ],
  controllers: [],
  providers: [
    TransfersService,
    TransfersRepository,
    TransfersListener,
    TransferEntityToDto,
  ],
  exports: [TransfersService],
})
export class TransfersModule {}
