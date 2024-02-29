// Lib specific fields chat_id and parse_mode
/* eslint-disable camelcase */
import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { TelegramSendMessageParams, TelegramService } from 'nestjs-telegram';

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

  override async warn(
    message: string,
    stack?: string,
    context?: string,
  ): Promise<void> {
    const tlgrmMsg = this.buildMessage(
      process.env.TELEGRAM_WARN_CHAT_ID,
      'WARN',
      message,
      context,
      stack,
    );

    await this.telegram
      .sendMessage(tlgrmMsg)
      .toPromise()
      .catch(() => {
        this.warn(
          'Failed to send warning report to Telegram, check server logs for more details.',
        );
      });

    super.warn(message, stack, context);
  }
  override async error(
    message: string,
    stack?: string,
    context?: string,
  ): Promise<void> {
    const tlgrmMsg = this.buildMessage(
      process.env.TELEGRAM_ERROR_CHAT_ID,
      'ERROR',
      message,
      context,
      stack,
    );

    await this.telegram
      .sendMessage(tlgrmMsg)
      .toPromise()
      .catch(() => {
        this.error(
          'Failed to send error report to Telegram, check server logs for more details.',
        );
      });

    super.error(message, stack, context);
  }

  private buildMessage(
    chatId: string,
    logLevel: string,
    messageTxt: string,
    context?: string,
    stack?: string,
  ): TelegramSendMessageParams {
    const icon = logLevel === 'ERROR' ? '🚨' : '⚠️';

    return {
      chat_id: chatId,
      text:
        `${icon} <b>Application:</b> ${process.env.APP_NAME} ${icon}\n` +
        `<b>Environment:</b> ${process.env.APP_ENV}\n` +
        `<b>Log Level:</b> ${logLevel}\n` +
        `${context ? `<b>Context:</b> ${context}\n` : ''}` +
        `<b>Message:</b> ${messageTxt}\n` +
        `${stack ? `<b>Stack:</b> ${stack}` : ''}`,
      parse_mode: 'html',
      disable_web_page_preview: true,
    };
  }
}
