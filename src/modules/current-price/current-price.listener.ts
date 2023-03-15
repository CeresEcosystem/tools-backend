import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { CronExpression } from 'src/utils/cron-expression.enum';
import { CurrentPriceBcDto } from './dto/current-price-bc.dto';
import { CurrentPriceService } from './current-price.service';

const TOKEN_PRICES_URL = 'https://api.cerestoken.io/prices';

@Injectable()
export class CurrentPriceListener {
  private readonly logger = new Logger(CurrentPriceListener.name);

  constructor(
    private readonly currentPriceService: CurrentPriceService,
    private readonly httpService: HttpService,
  ) {}

  // TODO: Phase II - Refactor this class to listen to changes on BC.

  @Cron(CronExpression.EVERY_MINUTE)
  async fetchTokenPrices(): Promise<void> {
    this.logger.log('Start downloading token prices.');

    const { data } = await firstValueFrom(
      this.httpService.get<CurrentPriceBcDto[]>(TOKEN_PRICES_URL),
    );

    this.currentPriceService.save(data);

    this.logger.log('Downloading of token prices was successful!');
  }
}
