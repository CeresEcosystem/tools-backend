import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const URL_THRESHOLDS = [
  {
    url: '/api/trading/history',
    warn: 10000,
    error: 20000,
  },
  {
    url: '/api/portfolio',
    warn: 3000,
    error: 10000,
  },
  {
    url: '/',
    warn: 1000,
    error: 3000,
  },
];

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, path: url } = request;

    const body = JSON.stringify(request.body);
    const query = JSON.stringify(request.query);

    this.logger.debug(
      `Request: ${method} ${url}, body: ${body}, query: ${query}`,
    );

    const startTimestamp = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.handleResponse(context, method, url, startTimestamp);
      }),
    );
  }

  private handleResponse(
    context: ExecutionContext,
    method: string,
    url: string,
    startTimestamp: number,
  ): void {
    const response = context.switchToHttp().getResponse<Response>();
    const { statusCode } = response;
    const duration = Date.now() - startTimestamp;
    const urlThreshold = URL_THRESHOLDS.find((threshold) =>
      url.startsWith(threshold.url),
    );

    this.logger.debug(
      `Response duration: ${method} ${url} ${statusCode}: ${duration}ms`,
    );

    const msg = `Execution too long: ${method} ${url} ${statusCode}: ${duration}ms`;

    if (duration > urlThreshold.warn) {
      this.logger.warn(msg);
    }

    if (duration > urlThreshold.error) {
      this.logger.error(msg);
    }
  }
}
