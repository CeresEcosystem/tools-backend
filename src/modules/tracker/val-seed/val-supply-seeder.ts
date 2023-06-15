import { Logger } from '@nestjs/common';
import { Console, Command, createSpinner } from 'nestjs-console';
import * as fs from 'fs';
import { VALTrackerBlockBcToEntityMapper } from '../mapper/val-tracker-block-bc-to-entity.mapper';
import { getDateFormatted } from 'src/utils/date-utils';
import { TrackerSupplyRepository } from '../tracker-supply.repository';

export const JSON_STORAGE_PATH = 'storage/json/';

@Console()
export class ValSupplySeeder {
  private readonly logger = new Logger(ValSupplySeeder.name);

  constructor(
    private readonly supplyRepository: TrackerSupplyRepository,
    private readonly mapper: VALTrackerBlockBcToEntityMapper,
  ) {}

  @Command({
    command: 'setSupplyDateRaw',
  })
  public async setDateRaw(): Promise<void> {
    const spin = createSpinner();
    spin.start('Preparing the file');

    const currentBlockNum = Number(process.env.CURRENT_BLOCK_NUM);

    if (!currentBlockNum) {
      spin.fail('Current block num not set');
      return;
    }

    const valBurningDataFile = fs.readFileSync(
      `${JSON_STORAGE_PATH}/val-supply-data.json`,
      'utf8',
    );

    const valSupplyData = JSON.parse(valBurningDataFile);

    const distinctDates = [];

    valSupplyData.forEach((row) => {
      const date = new Date();
      date.setTime(row[0]);

      row[2] = getDateFormatted(date);

      if (
        distinctDates.length === 0 ||
        row[2] !== distinctDates[distinctDates.length - 1][2]
      ) {
        distinctDates.push(row);
      }
    });

    fs.writeFileSync(
      `${JSON_STORAGE_PATH}/val-supply-data-complete.json`,
      JSON.stringify(distinctDates),
    );

    spin.succeed('Preparing the file done');
  }

  @Command({
    command: 'seedValSupplyData',
    description: 'Seed Val Supply Data',
  })
  public async seed(): Promise<void> {
    const spin = createSpinner();
    spin.start('Seeding the DB');

    await this.seedValSupplyData();

    spin.succeed('Seeding done');
  }

  private async seedValSupplyData() {
    const valSupplyDataFile = fs.readFileSync(
      `${JSON_STORAGE_PATH}/val-supply-data-complete.json`,
      'utf8',
    );

    const valSupplyData = JSON.parse(valSupplyDataFile);

    for (const row of valSupplyData) {
      await this.supplyRepository.save('VAL', row[1], row[2]);
    }
  }
}
