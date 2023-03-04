import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from 'nestjs-telegram';
import { TelegramLogger } from './telegram-logger';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegramModule.forRoot({
      botKey: process.env.TELEGRAM_BOT_TOKEN,
    }),
  ],
  controllers: [],
  providers: [TelegramLogger],
  exports: [TelegramLogger],
})
export class TelegramLoggerModule {}
