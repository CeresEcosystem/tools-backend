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
  grossBurn: number;
  netBurn: number;
  remintedLp: number;
  remintedParliament: number;
  xorSpent: number;
  xorDedicatedForBuyBack: number;
}

export interface TrackerBurnDto {
  gross: string;
  net: string;
}

export interface TrackerBurningGraphPointDto {
  lp: number;
  net: number;
  parl: number;
  spent: number;
  back: number;
  x: string;
  y: number;
}

export interface TrackerSupplyGraphPointDto {
  x: string;
  y: string;
}
