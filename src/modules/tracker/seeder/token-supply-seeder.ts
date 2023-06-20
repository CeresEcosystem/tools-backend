import { Console, Command, createSpinner } from 'nestjs-console';
import { TrackerSupplyRepository } from '../tracker-supply.repository';
import { TokenPriceService } from 'src/modules/token-price/token-price.service';
import { TokenPrice } from 'src/modules/token-price/entity/token-price.entity';
import { catchError, firstValueFrom, of, retry } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { TokenSupply } from '../dto/token-supply.dto';
import { getDateFormatted } from 'src/utils/date-utils';
import Big from 'big.js';
import {
  DateTokenSupplyTupleDto,
  FormatedTokenSupply,
} from '../dto/formated-token-supply.dto';

export const EXCLUDED_TOKENS = ['PSWAP', 'VAL'];

@Console()
export class TokenSupplySeeder {
  constructor(
    private readonly tokenPriceService: TokenPriceService,
    private readonly httpService: HttpService,
    private readonly supplyRepository: TrackerSupplyRepository,
  ) {}

  @Command({
    command: 'populateTokenSupplyData',
    description:
      'Fetches historic supply data for all tokens, formats it and saves it into the database',
  })
  public async populateTokenSupplyData() {
    const spin = createSpinner();
    // Get token names
    spin.start('Fetching token names...');
    const tokenNames = await this.getTokenNames();
    spin.succeed('Token names fetched');
    // Fetch, format and save data for each token
    for (let token of tokenNames) {
      // Fetching historic supply data
      const tokenHistoricSupply: TokenSupply =
        await this.fetchHistoricTokenSupply(token);

      if (tokenHistoricSupply.supplies.length === 0) {
        continue;
      }

      // Format historic data
      const formatedHTV = this.formatHTV(token, tokenHistoricSupply);

      // Save historic supply data
      await this.saveHistoricTokenSupply(formatedHTV);
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

  // Used to fetch historical supply data of specific token data
  private async fetchHistoricTokenSupply(token: string): Promise<TokenSupply> {
    const spin = createSpinner();

    spin.start(`Fetching historic supply data for ${token}...`);

    const tokenHistoricSupply: TokenSupply = await this.getHistoricTokenSupply(
      `https://sora-qty.info/data/${token.toLocaleLowerCase()}.json`,
      spin,
      token,
    );

    spin.stop();

    return tokenHistoricSupply;
  }

  // Function for GET call of historic token supply data
  private async getHistoricTokenSupply<T>(
    url: string,
    spin: any,
    token: string,
  ): Promise<TokenSupply> {
    const { data } = await firstValueFrom(
      this.httpService.get<T>(url, { timeout: 1000 }).pipe(
        //retry({ count: 10, delay: 1000 }),
        catchError((error: AxiosError) => {
          spin.fail(
            `Could not fetch historic supply data for ${token}. ${error.message}`,
          );
          spin.stop();
          return of({ data: undefined });
        }),
      ),
    );

    if (data) {
      spin.succeed(`Fetched historic supply data for ${token}`);
    }

    return new TokenSupply(data);
  }

  // Function for formating historic token data
  private formatHTV(token: string, data: TokenSupply): FormatedTokenSupply {
    let formatedHTV: DateTokenSupplyTupleDto[] = [];

    let startDate = new Date(+data.supplies[0].timestamp);
    let currentDate = new Date();
    let totalSupply = new Big(0);
    let supplyCount = new Big(0);

    for (const supply of data.supplies) {
      currentDate = new Date(+supply.timestamp);

      if (this.isSameDay(startDate, currentDate)) {
        totalSupply = totalSupply.add(supply.supply);
        supplyCount = supplyCount.add(1);
      } else {
        const averageSupply = totalSupply.div(supplyCount);

        formatedHTV.push({
          token: token,
          date: getDateFormatted(startDate),
          supply: averageSupply.toFixed(2),
        });

        totalSupply = new Big(supply.supply);
        supplyCount = new Big(1);
        startDate = currentDate;
      }
    }

    const averageSupply = totalSupply.div(supplyCount);

    formatedHTV.push({
      token: token,
      date: getDateFormatted(startDate),
      supply: averageSupply.toFixed(2),
    });

    return new FormatedTokenSupply(formatedHTV);
  }

  // Utility function used for checking if days are of the same date
  private isSameDay(firstDate: Date, secondDate: Date): boolean {
    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
    );
  }

  // Function for saving historic token supply data
  private async saveHistoricTokenSupply(formatedHTV: FormatedTokenSupply) {
    const spin = createSpinner();
    spin.start(
      `Saving historic supply data for ${formatedHTV.supplies[0].token}...`,
    );

    try {
      for (const supply of formatedHTV.supplies) {
        await this.supplyRepository.save(
          supply.token,
          supply.supply,
          supply.date,
        );
      }
      spin.succeed(
        `Historic supply data for ${formatedHTV.supplies[0].token} has been saved`,
      );
    } catch (err) {
      spin.fail(
        `An error occured while saving historic supply data for ${formatedHTV.supplies[0].token}. Error: ${err}`,
      );
    }
  }
}
