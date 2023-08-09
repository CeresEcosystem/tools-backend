import { Module } from '@nestjs/common';
import { AuthClient } from './auth-client';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [AuthClient],
  exports: [AuthClient],
})
export class AuthModule {}
