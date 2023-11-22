import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from './transactions.repository';
import { TransactionsListener } from './transactions.listener';
import { TransactionEntityToDto } from './mapper/tx-entity-to-dto.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entity/transactions.entity';
import { SoraClientModule } from '../sora-client/sora-client-module';

@Module({
  imports: [SoraClientModule, TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    TransactionsRepository,
    TransactionsListener,
    TransactionEntityToDto,
  ],
  exports: [],
})
export class TransactionsModule {}
