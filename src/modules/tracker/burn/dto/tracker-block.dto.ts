import { Expose } from 'class-transformer';
import { BurnType } from '../entity/tracker.entity';

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
