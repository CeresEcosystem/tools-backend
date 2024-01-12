import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CurrencyRateRepository } from './currency-rate.repository';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, retry } from 'rxjs';
import { CURRENCY_RATES_API_URL } from './currency-rate.const';
import { CurrencyRateDto } from './dto/currency-rate.dto';
import { CurrencyRateToEntityMapper } from './mapper/currency-rate-to-entity.mapper';
import { CurrencyRate } from './entity/currency-rate.entity';
import { CurrencyDto } from './dto/currency.dto';

@Injectable()
export class CurrencyRateService {
  private readonly logger = new Logger(CurrencyRateService.name);

  constructor(
    private readonly currencyRateRepo: CurrencyRateRepository,
    private readonly httpService: HttpService,
    private readonly currencyRateMapper: CurrencyRateToEntityMapper,
  ) {}

  public async getCurrencyRate(
    currencyDto: CurrencyDto,
  ): Promise<CurrencyRate> {
    const currencyRate = await this.currencyRateRepo.findCurrencyRate(
      currencyDto.currency,
    );

    if (!currencyRate) {
      throw new BadRequestException('Currency rate does not exist.');
    }

    return currencyRate;
  }

  @Cron(CronExpression.EVERY_4_HOURS)
  async fetchCurrencyRates(): Promise<void> {
    this.logger.log('Start fetching currency rates.');

    const { data } = await firstValueFrom(
      this.httpService
        .get<{ data: Record<string, number> }>(
          `${CURRENCY_RATES_API_URL}?apikey=${process.env.FREE_CURRENCY_API_KEY}`,
        )
        .pipe(
          retry({ count: 10, delay: 1000 }),
          catchError((error: AxiosError) => {
            this.logWarning(error);
            throw new BadGatewayException('Currency Rates API unreachable.');
          }),
        ),
    );

    const currencyRates = Object.entries(data?.data).map(([currency, rate]) =>
      this.currencyRateMapper.toEntity({ currency, rate } as CurrencyRateDto),
    );

    this.currencyRateRepo.upsertAll(currencyRates);

    this.logger.log('Fetching and saving currency rates was successful!');
  }

  private logWarning(error: AxiosError): void {
    this.logger.warn(
      `An error happened while contacting currency rates API!
      msg: ${error.message}, code: ${error.code}, cause: ${error.cause}`,
    );
  }
}
