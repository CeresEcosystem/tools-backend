import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, retry } from 'rxjs';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { TrackerSupplyRepository } from './tracker-supply.repository';
import { TokenPrice } from '../token-price/entity/token-price.entity';
import { TokenPriceService } from '../token-price/token-price.service';

const SORA_SUPPLY_URL = 'https://mof.sora.org/qty/';

@Injectable()
export class TrackerSupplySync {
  private readonly logger: Logger = new Logger(TrackerSupplySync.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly trackerSupplyRepository: TrackerSupplyRepository,
    private readonly tokenPriceService: TokenPriceService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncTrackerSupply(): Promise<void> {
    this.logger.log('Start fetching token supplies from SORA API.');

    const trackedTokens = await this.getTokenNames();

    await Promise.all(
      trackedTokens.map((token) => this.updateTokenSupply(token)),
    );

    this.logger.log('Fetching of token supplies was successful!');
  }

  private async updateTokenSupply(token: string): Promise<void> {
    const trackerSupply = await this.getTokenSupply(token);

    if (trackerSupply) {
      this.trackerSupplyRepository.save(token, trackerSupply);
    }
  }

  private async getTokenSupply(token: string): Promise<string> {
    const { data: trackerSupply } = await firstValueFrom(
      this.httpService
        .get<string>(`${SORA_SUPPLY_URL}${token}`, { timeout: 2000 })
        .pipe(
          retry({ count: 30, delay: 1000 }),
          catchError((error: AxiosError) => {
            this.logWarning(token, error);
            throw new BadGatewayException('Sora API unreachable.');
          }),
        ),
    );

    return trackerSupply;
  }

  private async getTokenNames(): Promise<string[]> {
    const tokenPrices: TokenPrice[] = await this.tokenPriceService.findAll();

    return tokenPrices.map((tokenPrices) => tokenPrices.token);
  }

  private logWarning(token: string, error: AxiosError): void {
    this.logger.warn(
      `An error happened while fetching ${token} supply!
      msg: ${error.message}, code: ${error.code}, cause: ${error.cause}`,
    );
  }
}
