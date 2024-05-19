import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenBurn } from './entity/token-burn.entity';
import { TokenBurnController } from './token-burn.controller';
import { TokenBurnService } from './token-burn.service';
import { KensetsuController } from './kensetsu.controller';
import { TokenBurnListener } from './token-burn.listener';
import { SoraClientModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [SoraClientModule, TypeOrmModule.forFeature([TokenBurn])],
  controllers: [TokenBurnController, KensetsuController],
  providers: [TokenBurnService, TokenBurnListener],
  exports: [],
})
export class TokenBurnModule {}
