import { FPNumber } from '@sora-substrate/math';

export const CACHE_KEYS = {
  TRACKER: 'tracker',
};

export const CACHE_TTL = {
  FIVE_MINUTES: 5 * 60 * 1000,
};

export const DENOMINATOR = FPNumber.fromNatural(Math.pow(10, 18));
