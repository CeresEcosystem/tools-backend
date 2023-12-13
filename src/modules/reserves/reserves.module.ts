import { Module } from '@nestjs/common';
import { ReservesController } from './reserves.controller';
import { ReservesService } from './reserves.service';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { ReservesRepository } from './reserves.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserve } from './entity/reserves.entity';

@Module({
  imports: [PortfolioModule, TypeOrmModule.forFeature([Reserve])],
  controllers: [ReservesController],
  providers: [ReservesService, ReservesRepository],
})
export class ReservesModule {}
