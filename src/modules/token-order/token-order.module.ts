import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenOrder } from './entity/token-order.entity';
import { TokenOrderService } from './token-order.service';
import { TokenOrderToDtoMapper } from './mapper/to-dto.mapper';
import { TokenOrderController } from './token-order.controller';
import { AuthModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([TokenOrder])],
  controllers: [TokenOrderController],
  providers: [TokenOrderService, TokenOrderToDtoMapper],
  exports: [TokenOrderService],
})
export class TokenOrderModule {}
