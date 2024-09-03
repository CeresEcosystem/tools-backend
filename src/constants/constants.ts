// SORA NETWORK //
export const XOR_ADDRESS =
  '0x0200000000000000000000000000000000000000000000000000000000000000';
export const XSTUSD_ADDRESS =
  '0x0200080000000000000000000000000000000000000000000000000000000000';
export const RESERVE_ADDRESS =
  'cnTQ1kbv7PBNNQrEb1tZpmK7eE2hQTwktcdewhc55bpkDrYBX';
export const DOT_ADDRESS =
  '0x0003b1dbee890acfb1b3bc12d1bb3b4295f52755423f84d1751b2545cebf000b';
export const ACALA_ADDRESS =
  '0x001ddbe1a880031da72f7ea421260bec635fa7d1aa72593d5412795408b6b2ba';
export const ASTAR_ADDRESS =
  '0x009dd037fcb32f4fe17c513abd4641a2ece844d106e30788124f0c0acc6e748e';
export const KSM_ADDRESS =
  '0x00117b0fa73c4672e03a7d9d774e3b3f91beb893e93d9a8d0430295f44225db8';
  export const KUSD_ADDRESS =
  '0x02000c0000000000000000000000000000000000000000000000000000000000';

// COIN GECKO IDS //
export const SYMBOLS_AND_GECKO_IDS = {
  MANA: 'decentraland',
  GRT: 'the-graph',
  HUSD: 'husd',
  XOR: 'sora',
  VAL: 'sora-validator-token',
  CREAM: 'cream-2',
  XFUND: 'xfund',
  COMP: 'compound-governance-token',
  UNI: 'uniswap',
  LINK: 'chainlink',
  AAVE: 'aave',
  DEO: 'demeter',
  OCEAN: 'ocean-protocol',
  FIS: 'stafi',
  DAI: 'dai',
  IDEX: 'aurora-dao',
  HT: 'huobi-token',
  HMX: 'hermes-dao',
  USDC: 'usd-coin',
  UST: 'terrausd',
  SUSHI: 'sushi',
  HOT: 'holotoken',
  KNC: 'kyber-network',
  DIA: 'dia-data',
  CAPS: 'coin-capsule',
  PDEX: 'polkadex',
  AKRO: 'akropolis',
  USDT: 'tether',
  CERES: 'ceres',
  LEO: 'leo-token',
  BUSD: 'binance-usd',
  NEXO: 'nexo',
  ETH: 'ethereum',
  REN: 'republic-protocol',
  PHA: 'pha',
  BAT: 'basic-attention-token',
  RLC: 'iexec-rlc',
  CRV: 'curve-dao-token',
  XRT: 'robonomics-network',
  PSWAP: 'polkaswap',
  OKB: 'okb',
  UMI: 'umi-digital',
  KSM: 'kusama',
  MATIC: 'matic-network',
  UMA: 'uma',
  AGI: 'singularitynet',
  WCFG: 'wrapped-centrifuge',
  RARE: 'unique-one',
  REEF: 'reef',
  DOT: 'polkadot',
  CRO: 'crypto-com-chain',
};

export const COIN_GECKO_TOKEN_SYMBOLS = Object.keys(SYMBOLS_AND_GECKO_IDS);

export const COIN_GECKO_TOKEN_IDS = Object.values(SYMBOLS_AND_GECKO_IDS);

export const IS_WORKER_INSTANCE = process.env.WORKER_INSTANCE === 'true';
export const CRON_DISABLED = !IS_WORKER_INSTANCE;
