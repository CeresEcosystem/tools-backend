import { SummaryPeriod } from './burn/entity/tracker-summary.entity';
import { PageDto } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';
import { TrackerSupplyGraphPointDto } from './supply/dto/tracker-supply.dto';
import {
  TrackerBlockDto,
  TrackerBurnDto,
  TrackerBurningGraphPointDto,
} from './burn/dto/tracker-block.dto';

export interface TrackerDto {
  blocksFees: PageDto<TrackerBlockDto>;
  blocksTbc: PageDto<TrackerBlockDto>;
  burn: Map<SummaryPeriod, TrackerBurnDto>;
  graphBurning: TrackerBurningGraphPointDto[];
  graphSupply: TrackerSupplyGraphPointDto[];
  last: number;
}
