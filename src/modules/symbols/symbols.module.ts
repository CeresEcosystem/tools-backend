import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolsMapper } from './mapper/create-symbol-to-entity.mapper';
import { TokenSymbol } from './entity/symbol.entity';
import { SymbolsService } from './symbols.service';
import { SymbolsAdminMapper } from './mapper/symbol-to-admin-dto.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([TokenSymbol])],
  controllers: [],
  providers: [SymbolsService, SymbolsMapper, SymbolsAdminMapper],
  exports: [SymbolsService],
})
export class SymbolsModule {}
