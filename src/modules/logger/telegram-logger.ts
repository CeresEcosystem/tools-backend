import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { TelegramService } from 'nestjs-telegram';

const STANDARD_LOG_LEVELS: LogLevel[] = ['log', 'warn', 'error'];
const DEBUG_LOG_LEVELS: LogLevel[] = ['debug', 'verbose'];

@Injectable()
export class TelegramLogger extends ConsoleLogger {
  constructor(private readonly telegram: TelegramService) {
    super();
    this.setLogLevels(
      process.env.LOG_DEBUG
        ? STANDARD_LOG_LEVELS.concat(DEBUG_LOG_LEVELS)
        : STANDARD_LOG_LEVELS,
    );
  }

  async warn(message: any, context?: string) {
    await this.telegram
      .sendMessage({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text:
          `⚠️ <b>Application:</b> ${process.env.APP_NAME} ⚠️\n` +
          `<b>Environment:</b> ${process.env.APP_ENV}\n` +
          `<b>Log Level:</b> WARN\n` +
          (context ? `<b>Context:</b> ${context}\n` : ``) +
          `<b>Message:</b> <pre>${message}</pre>\n`,
        parse_mode: 'html',
      })
      .toPromise()
      .catch((reason) => {
        super.error('Error sending warning msg to telegram: ' + reason);
      });

    super.warn(message, context);
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
        super.error('Error sending error msg to telegram: ' + reason);
      });

    super.error(message, stack, context);
  }
}
