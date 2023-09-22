import { Module } from '@nestjs/common';
import { SwapRepository } from './swaps.repository';
import { DbConnectionService } from './db-connection.service';
import { SwapsController } from './swaps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Swap } from './entity/swaps.entity';
import { SwapGateway } from './swaps.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Swap])],
  controllers: [SwapsController],
  providers: [SwapRepository, DbConnectionService, SwapGateway],
})
export class SwapsModule {
  constructor(swap: SwapRepository, dbConnection: DbConnectionService) {
    swap.writeSwapToDatabase();
    dbConnection.connect();
  }
}
