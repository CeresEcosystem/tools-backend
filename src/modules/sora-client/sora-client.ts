import { Injectable, Logger } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { options } from '@sora-substrate/api';
import { PROVIDERS } from './sora-client.const';

@Injectable()
export class SoraClient {
  private readonly logger = new Logger(SoraClient.name);

  private readonly provider = new WsProvider(PROVIDERS);
  private soraApi: ApiPromise;
  private initInProgress = false;

  constructor() {
    this.initSoraApi();
  }

  public async getSoraApi(): Promise<ApiPromise> {
    await this.waitIfInitInProgress();

    return this.soraApi;
  }

  private async initSoraApi(): Promise<void> {
    this.initInProgress = true;
    this.logger.log('Initializing Sora API.');

    this.soraApi = await ApiPromise.create(
      options({ provider: this.provider, noInitWarn: true }),
    );

    this.logger.log('Initialized Sora API.');
    this.initInProgress = false;
  }

  private async waitIfInitInProgress(): Promise<void> {
    while (this.initInProgress) {
      // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
