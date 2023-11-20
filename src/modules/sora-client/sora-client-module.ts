import { Module } from '@nestjs/common';
import { SoraClient } from './sora-client';

@Module({
  providers: [SoraClient],
  exports: [SoraClient],
})
export class SoraClientModule {}
