import { Module } from '@nestjs/common';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { TransfersRepository } from './transfers.repository';
import { TransfersListener } from './transfers.listener';
import { TransferEntityToDto } from './mapper/transfer-entity-to-dto.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entity/transfer.entity';
import { SoraClientModule } from '../sora-client/sora-client-module';

@Module({
  imports: [SoraClientModule, TypeOrmModule.forFeature([Transfer])],
  controllers: [TransfersController],
  providers: [
    TransfersService,
    TransfersRepository,
    TransfersListener,
    TransferEntityToDto,
  ],
  exports: [],
})
export class TransfersModule {}
