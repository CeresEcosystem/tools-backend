import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const body = JSON.stringify(req.body);

    this.logger.debug(`Request: ${req.method} ${req.baseUrl}, body: ${body}`);

    next();
  }
}
