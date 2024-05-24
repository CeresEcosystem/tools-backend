import { BurnType } from '../entity/tracker.entity';
import { SummaryPeriod } from '../entity/tracker-summary.entity';
import { PageDto } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { Expose } from 'class-transformer';

export interface TrackerV2Dto {
  blocksFees: PageDto<TrackerBlockDto>;
  blocksTbc: PageDto<TrackerBlockDto>;
  burn: Map<SummaryPeriod, TrackerBurnDto>;
  graphBurning: TrackerBurningGraphPointDto[];
  graphSupply: TrackerSupplyGraphPointDto[];
  last: number;
}

export class TrackerBlockDto {
  @Expose()
  blockNum: number;

  @Expose()
  burnType: BurnType;

  @Expose()
  grossBurn: number;

  @Expose()
  netBurn: number;

  @Expose()
  remintedLp: number;

  @Expose()
  remintedParliament: number;

  @Expose()
  xorSpent: number;

  @Expose()
  xorDedicatedForBuyBack: number;
}

export interface TrackerBurnDto {
  gross: number;
  net: number;
}

export class TrackerBurningGraphPointDto {
  @Expose({ name: 'remintedLp' })
  lp: number;

  @Expose({ name: 'netBurn' })
  net: number;

  @Expose({ name: 'remintedParliament' })
  parl: number;

  @Expose({ name: 'xorSpent' })
  spent: number;

  @Expose({ name: 'xorDedicatedForBuyBack' })
  back: number;

  @Expose({ name: 'dateRaw' })
  x: string;

  @Expose({ name: 'grossBurn' })
  y: number;
}

export interface TrackerSupplyGraphPointDto {
  x: string;
  y: string;
}
