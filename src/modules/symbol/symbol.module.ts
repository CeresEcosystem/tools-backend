import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SymbolMapper } from './create-symbol-to-entity.mapper';
import { TokenSymbol } from './symbol.entity';
import { SymbolService } from './symbol.service';

@Module({
  imports: [TypeOrmModule.forFeature([TokenSymbol])],
  controllers: [],
  providers: [SymbolService, SymbolMapper],
  exports: [SymbolService],
})
export class SymbolModule {}
