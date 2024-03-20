import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KensetsuBurn } from './entity/kensetsu-burn.entity';
import { KensetsuController } from './kensetsu.controller';
import { KensetsuService } from './kensetsu.service';
import { SoraClientModule } from '../sora-client/sora-client-module';

@Module({
  imports: [SoraClientModule, TypeOrmModule.forFeature([KensetsuBurn])],
  controllers: [KensetsuController],
  providers: [KensetsuService],
  exports: [],
})
export class KensetsuModule {}
