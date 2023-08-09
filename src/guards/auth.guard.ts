import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthClient } from 'src/modules/auth/auth-client';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly authClient: AuthClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const bearerToken = this.extractTokenFromHeader(request);

    if (!bearerToken) {
      this.logger.log('Unauthenticated request!');

      return false;
    }

    request.user = await this.authClient.verifyToken(bearerToken);

    return true;
  }

  private extractTokenFromHeader(request: Request): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type === 'Bearer') {
      return token;
    }

    throw new UnauthorizedException('Token is missing.');
  }
}
