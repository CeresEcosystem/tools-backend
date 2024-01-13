import { Module } from '@nestjs/common';
import { ReservesController } from './reserves.controller';
import { ReservesService } from './reserves.service';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { ReservesRepository } from './reserves.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserve } from './entity/reserves.entity';
import { TokenPriceModule } from '../token-price/token-price.module';
import { ReserveEntityToDtoMapper } from './mapper/reserves-entity-to-dto.mapper';

@Module({
  imports: [
    PortfolioModule,
    TokenPriceModule,
    TypeOrmModule.forFeature([Reserve]),
  ],
  controllers: [ReservesController],
  providers: [ReservesService, ReservesRepository, ReserveEntityToDtoMapper],
  exports: [ReservesRepository],
})
export class ReservesModule {}
