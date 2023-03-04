import { ConsoleLogger, Injectable } from '@nestjs/common';
import { TelegramService } from 'nestjs-telegram';

@Injectable()
export class TelegramLogger extends ConsoleLogger {
  constructor(private readonly telegram: TelegramService) {
    super();
  }

  async error(message: any, stack?: string, context?: string) {
    await this.telegram
      .sendMessage({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text:
          `🚨 <b>Application:</b> Tools Backend 🚨\n` +
          `<b>Environment:</b> production\n` +
          `<b>Log Level:</b> ERROR\n` +
          `<b>Context:</b> ${context}\n` +
          `<b>Message:</b> <pre>${message}</pre>`,
        parse_mode: 'html',
      })
      .toPromise();

    super.error(message, stack, context);
  }
}
