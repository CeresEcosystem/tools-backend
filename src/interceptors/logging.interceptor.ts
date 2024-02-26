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

const REQUEST_DURATION_THRESHOLD_MS = 2000;

const IGNORED_URLS = ['/api/trading/history'];

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
    const endTimestamp = Date.now();

    const duration = endTimestamp - startTimestamp;

    this.logger.debug(
      `Response duration: ${method} ${url} ${statusCode}: ${duration}ms`,
    );

    if (
      duration > REQUEST_DURATION_THRESHOLD_MS &&
      IGNORED_URLS.indexOf(url) === -1
    ) {
      this.logger.warn(
        `Execution too long: ${method} ${url} ${statusCode}: ${duration}ms`,
      );
    }
  }
}
