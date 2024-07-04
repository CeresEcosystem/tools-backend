/* eslint-disable complexity */
import { Keyring } from '@polkadot/api';
import {
  ACALA_ADDRESS,
  ASTAR_ADDRESS,
  DOT_ADDRESS,
  KSM_ADDRESS,
  XOR_ADDRESS,
} from 'src/constants/constants';

export const convertAddress = (
  keyring: Keyring,
  type: string,
  address: string,
  assetId?: string,
): string => {
  switch (type) {
    case 'ETH':
      return keyring.encodeAddress(address, 69);
    case 'Polkadot':
      if (assetId === XOR_ADDRESS) {
        return keyring.encodeAddress(address, 81);
      } else if (assetId === DOT_ADDRESS) {
        return keyring.encodeAddress(address, 0);
      } else if (assetId === ACALA_ADDRESS) {
        return keyring.encodeAddress(address, 10);
      } else if (assetId === ASTAR_ADDRESS) {
        return keyring.encodeAddress(address, 5);
      }

      return address;
    case 'Kusama':
      if (assetId === XOR_ADDRESS) {
        return keyring.encodeAddress(address, 420);
      } else if (assetId === KSM_ADDRESS) {
        return keyring.encodeAddress(address, 2);
      }

      return address;
    case 'Liberland':
      return keyring.encodeAddress(address, 42);
    default:
      return address;
  }
};
