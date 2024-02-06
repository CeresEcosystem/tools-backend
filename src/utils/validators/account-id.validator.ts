import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';

const SORA_ACCOUNT_REGEX = /^cn[a-zA-Z0-9]{47}$/;
const ETH_ACCOUNT_REGEX = /^0x[a-fA-F0-9]{40}$/;

const SUPPORTED_ACCOUNT_FORMATS = [SORA_ACCOUNT_REGEX, ETH_ACCOUNT_REGEX];

@Injectable()
export class AccountIdValidator implements PipeTransform<string> {
  public transform(accountId: string): string {
    if (
      this.isSupportedAccountFormat(accountId) &&
      this.isValidChecksum(accountId)
    ) {
      return accountId;
    }

    throw new BadRequestException('AccountId is invalid');
  }

  private isSupportedAccountFormat = (accountId: string): boolean =>
    SUPPORTED_ACCOUNT_FORMATS.some((format) => format.test(accountId));

  private isValidChecksum(accountId: string): boolean {
    try {
      encodeAddress(
        isHex(accountId) ? hexToU8a(accountId) : decodeAddress(accountId),
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}
