import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KensetsuBurn } from './entity/kensetsu-burn.entity';
import { KensetsuController } from './kensetsu.controller';
import { KensetsuService } from './kensetsu.service';
import { KensetsuListener } from './kensetsu.listener';
import { SoraClientModule } from '../sora-client/sora-client-module';

@Module({
  imports: [SoraClientModule, TypeOrmModule.forFeature([KensetsuBurn])],
  controllers: [KensetsuController],
  providers: [KensetsuService, KensetsuListener],
  exports: [],
})
export class KensetsuModule {}
