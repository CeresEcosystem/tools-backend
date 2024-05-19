import { Module } from '@nestjs/common';
import { SwapRepository } from './swaps.repository';
import { SwapsController } from './swaps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Swap } from './entity/swaps.entity';
import { SwapListener } from './swaps.listener';
import { SwapGateway } from './swaps.gateway';
import { SwapEntityToDto } from './mapper/swap-entity-to-dto.mapper';
import { SwapService } from './swaps.service';
import { SoraClientModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [SoraClientModule, TypeOrmModule.forFeature([Swap])],
  controllers: [SwapsController],
  providers: [
    SwapRepository,
    SwapGateway,
    SwapListener,
    SwapEntityToDto,
    SwapService,
  ],
  exports: [SwapService],
})
export class SwapsModule {}
