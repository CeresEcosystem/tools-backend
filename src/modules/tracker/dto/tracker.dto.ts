import { TrackerBlockDto } from './tracker-block.dto';
import { TrackerBurnDto } from './tracker-burn.dto';
import { TrackerBurningGraphPointDto } from './tracker-burning-graph-point.dto';
import { TrackerSupplyGraphPointDto } from './tracker-supply-graph-point.dto';

export interface TrackerDto {
  blocks: TrackerBlockDto[];
  burn: [string, TrackerBurnDto];
  graphBurning: TrackerBurningGraphPointDto[];
  graphSupply: TrackerSupplyGraphPointDto[];
  last: number;
}
