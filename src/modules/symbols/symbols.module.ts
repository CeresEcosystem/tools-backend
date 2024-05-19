import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolsMapper } from './mapper/create-symbol-to-entity.mapper';
import { TokenSymbol } from './entity/symbol.entity';
import { SymbolsService } from './symbols.service';
import { SymbolsAdminMapper } from './mapper/symbol-to-admin-dto.mapper';
import { SymbolsController } from './symbols.controller';
import { AuthModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([TokenSymbol])],
  controllers: [SymbolsController],
  providers: [SymbolsService, SymbolsMapper, SymbolsAdminMapper],
  exports: [SymbolsService],
})
export class SymbolsModule {}
