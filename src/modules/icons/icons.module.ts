import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IconsService } from './icons.service';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  controllers: [],
  providers: [IconsService],
  exports: [],
})
export class IconsModule {}
