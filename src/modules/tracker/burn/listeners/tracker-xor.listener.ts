import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { TrackerService } from '../../tracker.service';
import { BurnType, Tracker } from '../entity/tracker.entity';
import {
  CronExpression,
  getTodayFormatted,
  SoraClient,
} from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { catchError, firstValueFrom, retry } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import Big from 'big.js';
import { Cron } from '@nestjs/schedule';
import { TrackerBurnService } from '../tracker-burn.service';
import { TrackerSummaryService } from '../tracker-summary.service';

const XOR_TOKEN = 'XOR';
const SORA_API = 'SORA_API';

@Injectable()
export class TrackerXorSync {
  private readonly logger = new Logger(TrackerXorSync.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly trackerService: TrackerService,
    private readonly trackerBurnService: TrackerBurnService,
    private readonly trackerSummaryService: TrackerSummaryService,
    private readonly soraClient: SoraClient,
    private readonly configs: ConfigService,
  ) {
    this.runListener();
  }

  private async runListener(): Promise<void> {
    this.logger.log('XOR burning data listener started.');
    const soraApi = await this.soraClient.getSoraApi();

    soraApi.rpc.chain.subscribeNewHeads(async (header) => {
      const { number } = header.toHuman() as { number: string };
      const currentBlockNum = Number(number.replaceAll(',', ''));

      let currentSupply = null;

      try {
        currentSupply = await this.getTokenSupply(XOR_TOKEN);
      } catch (error) {
        return;
      }

      const lastBlock = (await this.trackerService.findLastBlock(
        XOR_TOKEN,
        BurnType.FEES,
      )) || { blockNum: 0, netBurn: 0, grossBurn: 0, supply: currentSupply };

      if (lastBlock.blockNum === currentBlockNum) {
        return;
      }

      const burn = new Big(lastBlock.supply).sub(currentSupply);

      const blockToSave = {
        token: XOR_TOKEN,
        blockNum: currentBlockNum,
        burnType: BurnType.FEES,
        dateRaw: getTodayFormatted(),
        grossBurn: burn.toNumber(),
        netBurn: burn.toNumber(),
        supply: currentSupply,
      } as Tracker;

      this.trackerService.upsert([blockToSave]);
    });
  }

  private async getTokenSupply(token: string): Promise<string> {
    const { data: trackerSupply } = await firstValueFrom(
      this.httpService
        .get<string>(`${this.configs.get(SORA_API)}/qty/${token}`, {
          timeout: 500,
        })
        .pipe(
          retry({ count: 4, delay: 500 }),
          catchError((error: AxiosError) => {
            this.logWarning(token, error);
            throw new BadGatewayException('Sora API unreachable.');
          }),
        ),
    );

    return trackerSupply;
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  private async cacheData(): Promise<void> {
    await this.trackerBurnService.cacheBurningChartData(XOR_TOKEN);
    await this.trackerSummaryService.cacheBurningSummaryData(XOR_TOKEN);
  }

  private logWarning(token: string, error: AxiosError): void {
    this.logger.warn(
      `An error happened while fetching ${token} supply!
      msg: ${error.message}, code: ${error.code}, cause: ${error.cause}`,
    );
  }
}
