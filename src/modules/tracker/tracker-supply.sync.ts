import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, of, retry } from 'rxjs';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { TrackerSupplyRepository } from './tracker-supply.repository';

const SORA_SUPPLY_URL = 'https://mof.sora.org/qty/';
//const TRACKED_TOKENS = ['PSWAP', 'VAL'];

@Injectable()
export class TrackerSupplySync {
  private readonly logger: Logger = new Logger(TrackerSupplySync.name);
  private TRACKED_TOKENS: string[] = [];

  constructor(
    private readonly httpService: HttpService,
    private readonly trackerSupplyRepository: TrackerSupplyRepository,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async syncTrackedTokens() {
    this.logger.log('Start to sync tracked tokens');

    this.TRACKED_TOKENS = await this.getDestinctTokens();
    this.TRACKED_TOKENS.push('PSWAP', 'VAL'); // Can be added dynamically once PSWAP and VAL are seeded into the DB

    this.logger.log('Finished sync of tracked tokens');
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncTrackerSupply(): Promise<void> {
    this.logger.log('Start fetching token supply from SORA API.');

    for (const token of this.TRACKED_TOKENS) {
      await this.updateTokenSupply(token);
    }

    this.logger.log('Fetching of token supply was successful!');
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
            this.logger.warn(
              `An error happened while fetching ${token} supply! msg: ${error.message}, code: ${error.code}, cause: ${error.cause}`,
            );
            return of({ data: undefined });
          }),
        ),
    );

    return trackerSupply;
  }

  private async getDestinctTokens() {
    const result = await this.trackerSupplyRepository.query(
      'SELECT DISTINCT token FROM tracker_supply',
    );

    let tokens: string[] = [];

    for (const row of result) {
      tokens.push(row.token);
    }

    return tokens;
  }
}
