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
          `🚨 <b>Application:</b> ${process.env.APP_NAME} 🚨\n` +
          `<b>Environment:</b> ${process.env.APP_ENV}\n` +
          `<b>Log Level:</b> ERROR\n` +
          (context ? `<b>Context:</b> ${context}\n` : ``) +
          `<b>Message:</b> <pre>${message}</pre>\n` +
          (stack ? `<b>Stack:</b> <pre>${stack}</pre>` : ``),
        parse_mode: 'html',
      })
      .toPromise()
      .catch((reason) => {
        super.error('Error sending msg to telegram: ' + reason);
      });

    super.error(message, stack, context);
  }
}
