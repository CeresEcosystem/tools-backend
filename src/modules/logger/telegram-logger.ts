// Lib specific fields chat_id and parse_mode
/* eslint-disable camelcase */
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

  override async error(
    message: string,
    stack?: string,
    context?: string,
  ): Promise<void> {
    await this.telegram
      .sendMessage({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text:
          `🚨 <b>Application:</b> ${process.env.APP_NAME} 🚨\n` +
          `<b>Environment:</b> ${process.env.APP_ENV}\n` +
          '<b>Log Level:</b> ERROR\n' +
          `${context ? `<b>Context:</b> ${context}\n` : ''}` +
          `<b>Message:</b> ${message}\n` +
          `${stack ? `<b>Stack:</b> ${stack}` : ''}`,
        parse_mode: 'html',
      })
      .toPromise()
      .catch(() => {
        this.error(
          'Failed to send error report to Telegram, check server logs for more details.',
        );
      });

    super.error(message, stack, context);
  }
}
