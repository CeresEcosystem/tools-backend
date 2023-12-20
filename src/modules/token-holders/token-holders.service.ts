import { Injectable } from '@nestjs/common';
import { SoraClient } from '../sora-client/sora-client';
import { Keyring } from '@polkadot/api';
import { FPNumber } from '@sora-substrate/math';
import { TokenHoldersDto } from './dto/token-holders.dto';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { PageMetaDto } from 'src/utils/pagination/page-meta.dto';

@Injectable()
export class TokenHoldersService {
  private keyring = new Keyring();

  constructor(private readonly soraClient: SoraClient) {}

  private async getTokenHolders(assetId: string): Promise<TokenHoldersDto[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const soraApi: any = await this.soraClient.getSoraApi();
    const allStorageKeysSerialized = await soraApi.rpc.state.getKeys(
      '0x99971b5749ac43e0235e41b0d37869188ee7418a6531173d60d1f6a82d8f4d51',
    );

    const allStorageKeys = allStorageKeysSerialized.toHuman() as string[];

    const holders = allStorageKeys
      .filter((key) => key.includes(assetId.slice(2)))
      .map((key) =>
        this.keyring.encodeAddress(`0x${key.substring(98, 162)}`, 69),
      );

    const balances = await Promise.all(
      holders.map(async (holderId) => {
        const balance = await soraApi.rpc.assets.freeBalance(holderId, assetId);
        const balanceUnwrapped = new FPNumber(balance).toNumber();
        if (balanceUnwrapped > 0) {
          const data = {
            holder: holderId,
            balance: balanceUnwrapped,
          };

          return data;
        }

        return null;
      }),
    );

    const holdersAndBalances = balances.filter((balance) => balance !== null);

    return holdersAndBalances;
  }

  public async getTokenHoldersPaginated(
    pageOptions: PageOptionsDto,
    assetId: string,
  ): Promise<PageDto<TokenHoldersDto>> {
    const holdersAndBalances = await this.getTokenHolders(assetId);
    const meta = new PageMetaDto(
      pageOptions.page,
      pageOptions.size,
      holdersAndBalances.length,
    );

    return new PageDto(holdersAndBalances, meta);
  }
}
