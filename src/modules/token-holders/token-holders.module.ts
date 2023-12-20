import { Module } from '@nestjs/common';
import { SoraClientModule } from '../sora-client/sora-client-module';
import { TokenHoldersController } from './token-holders.controller';
import { TokenHoldersService } from './token-holders.service';

@Module({
  imports: [SoraClientModule],
  controllers: [TokenHoldersController],
  providers: [TokenHoldersService],
})
export class TokenHoldersModule {}
