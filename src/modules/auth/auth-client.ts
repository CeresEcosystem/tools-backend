import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { UserDto } from './dto/user.dto';
import { VerifyTokenRequest } from './dto/verify-token-request.dto';

const AUTH_SERVICE_BASE_URL = 'AUTH_SERVICE_BASE_URL';

@Injectable()
export class AuthClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly configs: ConfigService,
  ) {}

  public verifyToken(apiKey: string): Promise<UserDto> {
    const url = `${this.configs.get(AUTH_SERVICE_BASE_URL)}/auth/verify`;

    return this.sendPostRequest<UserDto>(url, { accessToken: apiKey });
  }

  private async sendPostRequest<T>(
    url: string,
    body: VerifyTokenRequest,
  ): Promise<T> {
    const { data } = await firstValueFrom(
      this.httpService.post<T>(url, body).pipe(
        catchError(() => {
          throw new UnauthorizedException();
        }),
      ),
    );

    return data;
  }
}
