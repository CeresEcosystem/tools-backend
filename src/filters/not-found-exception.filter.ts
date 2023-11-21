import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError } from 'typeorm';

@Catch(EntityNotFoundError)
export class NotFoundExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(NotFoundExceptionFilter.name);

  catch(exception: EntityNotFoundError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const message = JSON.stringify(exception.message);

    this.logger.log(`Exception: ${request.method} ${request.url} ${message}`);

    response.status(HttpStatus.NOT_FOUND).json('Not found');
  }
}
