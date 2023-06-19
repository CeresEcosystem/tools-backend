import { Console, Command, createSpinner } from 'nestjs-console';
import { TrackerSupplyRepository } from '../tracker-supply.repository';
import { TokenPriceService } from 'src/modules/token-price/token-price.service';
import { TokenPrice } from 'src/modules/token-price/entity/token-price.entity';
import { catchError, firstValueFrom, of, retry } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { TokenVolume } from '../dto/token-volume.dto';
import { getDateFormatted } from 'src/utils/date-utils';
import Big from 'big.js';
import {
  DateTokenVolumeTupleDto,
  FormatedTokenVolume,
} from '../dto/formated-token-volume.dto';

export const EXCLUDED_TOKENS = ['PSWAP', 'VAL'];

@Console()
export class TokenSupplySeeder {
  constructor(
    private readonly tokenPriceService: TokenPriceService,
    private readonly httpService: HttpService,
    private readonly supplyRepository: TrackerSupplyRepository,
  ) {}

  @Command({
    command: 'populateTokenVolumeData',
    description:
      'Fetches historic volume data for all tokens, formats it and saves it into the database',
  })
  public async populateTokenVolumeData() {
    const spin = createSpinner();
    // Get token names
    spin.start('Fetching token names...');
    const tokenNames = await this.getTokenNames();
    spin.succeed('Token names fetched');
    // Fetch, format and save data for each token
    for (let token of tokenNames) {
      // Fetching historic volume data
      const tokenHistoricVolume: TokenVolume =
        await this.fetchHistoricTokenVolume(token);

      if (tokenHistoricVolume.volumes.length === 0) {
        continue;
      }

      // Format historic data
      const formatedHTV = this.formatHTV(token, tokenHistoricVolume);

      // Save historic volume data
      await this.saveHistoricTokenVolume(formatedHTV);
    }
  }

  // Used to get token names from the database
  private async getTokenNames(): Promise<string[]> {
    const result: TokenPrice[] = await this.tokenPriceService.findAll();

    const tokenNames: string[] = [];

    result.forEach((token: TokenPrice) => {
      if (!EXCLUDED_TOKENS.includes(token.token)) {
        tokenNames.push(token.token);
      }
    });

    return tokenNames;
  }

  // Used to fetch historical volume data of specific token data
  private async fetchHistoricTokenVolume(token: string): Promise<TokenVolume> {
    const spin = createSpinner();

    spin.start(`Fetching historic volume data for ${token}...`);

    const tokenHistoricVolume: TokenVolume = await this.getHistoricTokenVolume(
      `https://sora-qty.info/data/${token.toLocaleLowerCase()}.json`,
      spin,
      token,
    );

    spin.stop();

    return tokenHistoricVolume;
  }

  // Function for GET call of historic token volume data
  private async getHistoricTokenVolume<T>(
    url: string,
    spin: any,
    token: string,
  ): Promise<TokenVolume> {
    const { data } = await firstValueFrom(
      this.httpService.get<T>(url, { timeout: 1000 }).pipe(
        //retry({ count: 10, delay: 1000 }),
        catchError((error: AxiosError) => {
          spin.fail(
            `Could not fetch historic volume data for ${token}. ${error.message}`,
          );
          spin.stop();
          return of({ data: undefined });
        }),
      ),
    );

    if (data) {
      spin.succeed(`Fetched historic volume data for ${token}`);
    }

    return new TokenVolume(data);
  }

  // Function for formating historic token data
  private formatHTV(token: string, data: TokenVolume): FormatedTokenVolume {
    let formatedHTV: DateTokenVolumeTupleDto[] = [];

    let startDate = new Date(+data.volumes[0].timestamp);
    let currentDate = new Date();
    let totalVolume = new Big(0);
    let volumeCount = new Big(0);

    for (const volume of data.volumes) {
      currentDate = new Date(+volume.timestamp);

      if (this.isSameDay(startDate, currentDate)) {
        totalVolume = totalVolume.add(volume.volume);
        volumeCount = volumeCount.add(1);
      } else {
        const averageVolume = totalVolume.div(volumeCount);

        formatedHTV.push({
          token: token,
          date: getDateFormatted(startDate),
          volume: averageVolume.toFixed(2),
        });

        totalVolume = new Big(volume.volume);
        volumeCount = new Big(1);
        startDate = currentDate;
      }
    }

    const averageVolume = totalVolume.div(volumeCount);

    formatedHTV.push({
      token: token,
      date: getDateFormatted(startDate),
      volume: averageVolume.toFixed(2),
    });

    return new FormatedTokenVolume(formatedHTV);
  }

  // Utility function used for checking if days are of the same date
  private isSameDay(firstDate: Date, secondDate: Date): boolean {
    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
    );
  }

  // Function for saving historic token volume data
  private async saveHistoricTokenVolume(formatedHTV: FormatedTokenVolume) {
    const spin = createSpinner();
    spin.start(
      `Saving historic volume data for ${formatedHTV.volumes[0].token}...`,
    );

    try {
      for (const volume of formatedHTV.volumes) {
        await this.supplyRepository.save(
          volume.token,
          volume.volume,
          volume.date,
        );
      }
      spin.succeed(
        `Historic volume data for ${formatedHTV.volumes[0].token} has been saved`,
      );
    } catch (err) {
      spin.fail(
        `An error occured while saving historic volume data for ${formatedHTV.volumes[0].token}. Error: ${err}`,
      );
    }
  }
}
