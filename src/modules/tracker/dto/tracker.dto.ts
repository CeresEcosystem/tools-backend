import { BurnType } from '../entity/tracker.entity';

export interface TrackerDto {
  blocks: TrackerBlockDto[];
  burn: Map<string, TrackerBurnDto>;
  graphBurning: TrackerBurningGraphPointDto[];
  graphSupply: TrackerSupplyGraphPointDto[];
  last: number;
}

export interface TrackerBlockDto {
  blockNum: number;
  burnType: BurnType;
  grossBurn: string;
  netBurn: string;
  remintedLp: string;
  remintedParliament: string;
  xorSpent: string;
  xorDedicatedForBuyBack: string;
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
