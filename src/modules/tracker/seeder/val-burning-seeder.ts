import { Logger } from '@nestjs/common';
import { Console, Command, createSpinner } from 'nestjs-console';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import { TrackerService } from '../tracker.service';
import { getDateFormatted } from 'src/utils/date-utils';
import { ValTbcTrackerBlockDto } from '../dto/val-tbc-tracker-bc-block';
import { ValTbcTrackerToEntityMapper } from '../mapper/val-tbc-tracker-to-entity.mapper';
import { FPNumber } from '@sora-substrate/math';
import { DENOMINATOR } from '../tracker.constants';
import Big from 'big.js';

export const CSV_STORAGE_PATH = 'storage/csv/';
const INSERT_BATCH_SIZE = 1000;

@Console()
export class ValBurningSeeder {
  private readonly logger = new Logger(ValBurningSeeder.name);

  constructor(
    private readonly trackerService: TrackerService,
    private readonly mapper: ValTbcTrackerToEntityMapper,
  ) {}

  @Command({
    command: 'setBurningDateRaw',
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
      `${CSV_STORAGE_PATH}/val-burning-data.csv`,
      'utf8',
    );

    const valBurningData = Papa.parse(valBurningDataFile, { header: true });

    valBurningData.data.forEach((row) => {
      const date = new Date();
      date.setTime(
        new Date().getTime() - (currentBlockNum - row['block_num']) * 6 * 1000,
      );

      row['dateRaw'] = getDateFormatted(date);
      row['blockNum'] = row['block_num'];
      row['valBurned'] = new FPNumber(row['val_burned'])
        .div(DENOMINATOR)
        .toString();
    });

    fs.writeFileSync(
      `${CSV_STORAGE_PATH}/val-burning-data-complete.csv`,
      Papa.unparse(valBurningData.data, { header: true }),
    );

    spin.succeed('Preparing the file done');
  }

  @Command({
    command: 'seedValBurningData',
    description: 'Seed Val Burning Data',
  })
  public async seed(): Promise<void> {
    const spin = createSpinner();
    spin.start('Seeding the DB');

    await this.seedValBurningData();

    spin.succeed('Seeding done');
  }

  private async seedValBurningData() {
    const valBurningDataFile = fs.readFileSync(
      `${CSV_STORAGE_PATH}/val-burning-data-complete.csv`,
      'utf8',
    );

    const valBurningData = Papa.parse<ValTbcTrackerBlockDto>(
      valBurningDataFile,
      { header: true },
    );

    fs.writeFileSync(
      `${CSV_STORAGE_PATH}/val-parse-result.json`,
      JSON.stringify(valBurningData),
    );

    const valBurningDataAgg: ValTbcTrackerBlockDto[] = [];

    valBurningData.data.reduce(function (res, burnRecord) {
      if (!res[burnRecord.blockNum]) {
        res[burnRecord.blockNum] = burnRecord;
        valBurningDataAgg.push(res[burnRecord.blockNum]);
      } else {
        const val = new Big(res[burnRecord.blockNum].valBurned)
          .add(burnRecord.valBurned)
          .toString();
        res[burnRecord.blockNum].valBurned = val;
      }
      return res;
    }, {});

    for (let i = 0; i < valBurningDataAgg.length; i += INSERT_BATCH_SIZE) {
      await this.trackerService.upsert(
        this.mapper.toEntities(
          valBurningDataAgg.slice(i, i + INSERT_BATCH_SIZE),
        ),
      );
    }
  }
}
