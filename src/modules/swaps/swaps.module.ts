import { Module } from '@nestjs/common';
import { SwapListener } from './swap.listener';
import { SwapsController } from './swaps.controller';
import { SwapsService } from './swaps.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Swap } from './entity/swaps.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Swap])],
  controllers: [SwapsController],
  providers: [SwapListener, SwapsService],
})
export class SwapsModule {}
