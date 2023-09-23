export interface TrackerDto {
  blocks: TrackerBlockDto[];
  burn: Map<string, TrackerBurnDto>;
  graphBurning: TrackerBurningGraphPointDto[];
  graphSupply: TrackerSupplyGraphPointDto[];
  last: number;
}

export interface TrackerBlockDto {
  blockNum: number;
  grossBurn: string;
  netBurn: string;
  remintedLp: string;
  remintedParliament: string;
  xorSpent: string;
  xorDedicatedForBuyBack: string;

  //FIXME: Deprecated fields
  pswapGrossBurn: string;
  pswapNetBurn: string;
  pswapRemintedLp: string;
  pswapRemintedParliament: string;
}

export interface TrackerBurnDto {
  gross: string;
  net: string;
}

export interface TrackerBurningGraphPointDto {
  lp: string;
  net: string;
  parl: string;
  spent: string;
  back: string;
  x: string;
  y: string;
}

export interface TrackerSupplyGraphPointDto {
  x: string;
  y: string;
}
