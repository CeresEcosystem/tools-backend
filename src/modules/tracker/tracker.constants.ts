import { FPNumber } from '@sora-substrate/math';

export const CACHE_KEYS = {
  TRACKER: 'tracker',
  SUPPLY: 'supply',
};

export const CACHE_TTL = {
  FIVE_MINUTES: 5 * 60 * 1000,
  ONE_HOUR: 1 * 60 * 60 * 1000,
};

export const DENOMINATOR = FPNumber.fromNatural(Math.pow(10, 18));

export const PROVIDER = 'wss://mof3.sora.org';
export const VAL_BURN_ADDRESS =
  'cnTQ1kbv7PBNNQrEb1tZpmK7ftiv4yCCpUQy1J2y7Y54Taiaw';
export const VAL_TOKEN_ID =
  '0x0200040000000000000000000000000000000000000000000000000000000000';
