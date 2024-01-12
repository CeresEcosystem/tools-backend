import { Logger } from '@nestjs/common';
import { Console, Command, createSpinner } from 'nestjs-console';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import Big from 'big.js';
import { ReservesService } from './reserves.service';
import { Reserve } from './entity/reserves.entity';
import { ChronoPriceService } from '../chrono-price/chrono-price.service';

export const CSV_STORAGE_PATH = 'storage/csv/';

@Console()
export class ReserveSeeder {
  private readonly logger = new Logger(ReserveSeeder.name);

  constructor(
    private readonly reservesService: ReservesService,
    private readonly chronoPriceService: ChronoPriceService,
  ) {}

  @Command({
    command: 'setReservesDataValue',
  })
  public async setReservesDataValue(): Promise<void> {
    const spin = createSpinner();
    spin.start('Preparing the file');

    const reservesFile = fs.readFileSync(
      `${CSV_STORAGE_PATH}/reservesMissingData.csv`,
      'utf8',
    );

    spin.info('Loaded CSV');

    const reservesData = Papa.parse<{
      balance: string;
      updatedAt: string;
      value: string;
    }>(reservesFile, { header: true });

    for (let i = 0; i < reservesData.data.length; i += 1) {
      const row = reservesData.data[i];
      const price = await this.getPriceAtMoment(new Date(row.updatedAt));
      spin.info(
        `Date: ${row.updatedAt} - Price: ${price} * Balance: ${row.balance}`,
      );
      row.value = new Big(row.balance).mul(price).toString();
    }

    spin.info('Writing to file');

    fs.writeFileSync(
      `${CSV_STORAGE_PATH}/reserves-missing-data-complete.csv`,
      Papa.unparse(reservesData.data, { header: true }),
    );

    spin.succeed('Preparing the file done');
  }

  private getPriceAtMoment(date: Date): Promise<number> {
    return this.chronoPriceService.getNearestPrice('TBCD', date);
  }

  @Command({
    command: 'seedReservesData',
    description: 'Seed Reserves Data',
  })
  public async seed(): Promise<void> {
    const spin = createSpinner();
    spin.start('Seeding the DB');

    await this.seedReservesData();

    spin.succeed('Seeding done');
  }

  private async seedReservesData(): Promise<void> {
    const valBurningDataFile = fs.readFileSync(
      `${CSV_STORAGE_PATH}/reserves-missing-data-complete.csv`,
      'utf8',
    );

    const reservesData = Papa.parse<{
      balance: string;
      updatedAt: string;
      value: string;
    }>(valBurningDataFile, {
      header: true,
    });

    for (let i = 0; i < reservesData.data.length; i += 1) {
      const reserve = new Reserve();
      reserve.tokenName = 'SORA TBC Dollar (TBCD)';
      reserve.tokenSymbol = 'TBCD';
      reserve.balance = reservesData.data[i].balance;
      reserve.value = Number(reservesData.data[i].value);
      reserve.updatedAt = new Date(reservesData.data[i].updatedAt);

      await this.reservesService.insert(reserve);
    }
  }
}
