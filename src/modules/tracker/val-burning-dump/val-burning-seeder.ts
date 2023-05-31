import { Logger } from '@nestjs/common';
import { Console, Command, createSpinner } from 'nestjs-console';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import { TrackerService } from '../tracker.service';
import { VALTrackerBlockBcToEntityMapper } from '../mapper/val-tracker-block-bc-to-entity.mapper';
import { ValTrackerBlockDto } from '../dto/val-tracker-bc-block';
import { getDateFormatted } from 'src/utils/date-utils';

@Console()
export class ValBurningSeeder {
  private readonly logger = new Logger(ValBurningSeeder.name);

  constructor(
    private readonly trackerService: TrackerService,
    private readonly mapper: VALTrackerBlockBcToEntityMapper,
  ) {}

  @Command({
    command: 'setDateRaw',
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
      'storage/csv/val-burning-data.csv',
      'utf8',
    );

    const valBurningData = Papa.parse(valBurningDataFile, { header: true });

    valBurningData.data.forEach((row) => {
      const date = new Date();
      date.setTime(
        new Date().getTime() - (currentBlockNum - row['block_num']) * 6 * 1000,
      );

      row['date_raw'] = getDateFormatted(date);
    });

    fs.writeFileSync(
      'storage/csv/val-burning-data-complete.json',
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
      'storage/csv/val-burning-data-complete.json',
      'utf8',
    );

    const valBurningData = Papa.parse(valBurningDataFile, { header: true });

    fs.writeFileSync(
      'storage/csv/val-parse-result.json',
      JSON.stringify(valBurningData),
    );

    let dtos = [];

    for (const [index, row] of valBurningData.data.entries()) {
      const valTrackerBlockDto = {
        dateRaw: row['date_raw'],
        blockNum: row['block_num'],
        xorTotalFee: row['xor_total_fee'] as string,
        valBurned: row['val_burned'] as string,
        valRemintedParliament: row['val_reminted_parliament'] as string,
        xorDedicatedForBuyBack: row['xor_dedicated_for_buy_back'] as string,
      } as ValTrackerBlockDto;

      dtos.push(valTrackerBlockDto);

      if (dtos.length >= 1000 || index === valBurningData.data.length - 1) {
        await this.trackerService.insert(this.mapper.toEntities(dtos));
        dtos = [];
      }
    }
  }
}
