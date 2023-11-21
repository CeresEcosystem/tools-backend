import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable, Logger } from '@nestjs/common';
import { getClientIp } from 'request-ip';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  private readonly logger = new Logger(ThrottlerBehindProxyGuard.name);

  override getTracker(req: Record<string, unknown>): Promise<string> {
    const clientIp = getClientIp(req);

    this.logger.debug(
      `Request: ${req.method} ${req.url}, ClientIP: ${clientIp}`,
    );

    return Promise.resolve(clientIp);
  }
}
