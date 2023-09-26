import { Console, Command, createSpinner } from 'nestjs-console';
import { TrackerSupplyRepository } from '../tracker-supply.repository';
import { TokenPriceService } from 'src/modules/token-price/token-price.service';
import { TokenPrice } from 'src/modules/token-price/entity/token-price.entity';
import { catchError, firstValueFrom, of, retry } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { getDateFormatted } from 'src/utils/date-utils';
import Big from 'big.js';
import { TokenSupplyDto } from '../dto/token-supply.dto';
import { FormattedTokenSupplyDto } from '../dto/formatted-token-supply.dto';

export const EXCLUDED_TOKENS = ['PSWAP', 'VAL'];

@Console()
export class TokenSupplySeeder {
  constructor(
    private readonly httpService: HttpService,
    private readonly supplyRepository: TrackerSupplyRepository,
    private readonly tokenPriceService: TokenPriceService,
  ) {}

  @Command({
    command: 'populateTokenSupplyData',
    description:
      'Fetches historic supply data for all tokens, formats it and saves it into the database',
  })
  public async populateTokenSupplyData() {
    const spin = createSpinner();

    spin.start('Fetching token names...');

    const tokenNames = await this.getTokenNames();

    spin.succeed('Token names fetched');

    for (const token of tokenNames) {
      if (!token) {
        continue;
      }

      const tokenSupplies: TokenSupplyDto[] = await this.fetchTokenSupplies(
        token,
      );

      if (tokenSupplies.length === 0) {
        continue;
      }

      const formatedSupplies = this.formatTokenSupplies(token, tokenSupplies);

      await this.saveTokenSupplies(formatedSupplies);
    }
  }

  private async getTokenNames(): Promise<string[]> {
    const tokenPrices: TokenPrice[] = await this.tokenPriceService.findAll();

    return tokenPrices.map((tokenPrices) =>
      !EXCLUDED_TOKENS.includes(tokenPrices.token) ? tokenPrices.token : null,
    );
  }

  private async fetchTokenSupplies(token: string): Promise<TokenSupplyDto[]> {
    const spin = createSpinner();

    spin.start(`Fetching historic supply data for ${token}...`);

    const tokenSupplies = await this.getTokenSupplies(
      `https://sora-qty.info/data/${token.toLocaleLowerCase()}.json`,
      spin,
      token,
    );

    spin.stop();

    return tokenSupplies.map(([timestamp, supply]) => {
      return {
        timestamp: String(timestamp),
        supply: String(supply),
      };
    });
  }

  private async getTokenSupplies(url: string, spin: any, token: string) {
    const { data } = await firstValueFrom(
      this.httpService.get<Array<number[]>>(url, { timeout: 1000 }).pipe(
        retry({ count: 10, delay: 1000 }),
        catchError((error: AxiosError) => {
          spin.fail(
            `Could not fetch historic supply data for ${token}. ${error.message}`,
          );
          spin.stop();
          return of({ data: new Array<number[]>() });
        }),
      ),
    );

    if (data.length != 0) {
      spin.succeed(`Fetched historic supply data for ${token}`);
    }

    return data;
  }

  private formatTokenSupplies(token: string, tokenSupplies: TokenSupplyDto[]) {
    const formattedSupplies = [];

    let startDate = new Date(+tokenSupplies[0].timestamp);
    let currentDate = new Date();
    let totalSupply = new Big(0);
    let supplyCount = new Big(0);

    for (const supply of tokenSupplies) {
      currentDate = new Date(+supply.timestamp);

      if (this.isSameDay(startDate, currentDate)) {
        totalSupply = totalSupply.add(supply.supply);
        supplyCount = supplyCount.add(1);
      } else {
        const averageSupply = totalSupply.div(supplyCount);

        formattedSupplies.push({
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

    formattedSupplies.push({
      token: token,
      date: getDateFormatted(startDate),
      supply: averageSupply.toFixed(2),
    });

    return formattedSupplies;
  }

  private isSameDay(firstDate: Date, secondDate: Date): boolean {
    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
    );
  }

  private async saveTokenSupplies(formattedHTV: FormattedTokenSupplyDto[]) {
    const spin = createSpinner();
    spin.start(`Saving historic supply data for ${formattedHTV[0].token}...`);

    try {
      for (const supply of formattedHTV) {
        await this.supplyRepository.save(
          supply.token,
          supply.supply,
          supply.date,
        );
      }
      spin.succeed(
        `Historic supply data for ${formattedHTV[0].token} has been saved`,
      );
    } catch (err) {
      spin.fail(
        `An error occurred while saving historic supply data for ${formattedHTV[0].token}. Error: ${err}`,
      );
    }
  }
}
