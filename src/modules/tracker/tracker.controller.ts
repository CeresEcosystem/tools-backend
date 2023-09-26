import {
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  ParseEnumPipe,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { TrackerDto, TrackerSupplyGraphPointDto } from './dto/tracker.dto';
import { CACHE_KEYS, CACHE_TTL } from './tracker.constants';
import { TrackerService } from './tracker.service';
import { BurnType } from './entity/tracker.entity';

@Controller('tracker')
@ApiTags('Tracker Controller')
export class TrackerController {
  private readonly logger = new Logger(TrackerController.name);

  constructor(
    private readonly trackerService: TrackerService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Get('/:token')
  public getTrackerData(@Param('token') token: string): Promise<TrackerDto> {
    return this.getTrackerDataByType(token, BurnType.FEES);
  }

  @Get('/:token/type/:burnType')
  public getTrackerDataByType(
    @Param('token') token: string,
    @Param('burnType', new ParseEnumPipe(BurnType)) burnType: BurnType,
  ): Promise<TrackerDto> {
    return this.cacheManager.wrap(
      `${CACHE_KEYS.TRACKER}-${token}-${burnType}`,
      () => this.trackerService.getTrackerData(token, burnType),
      CACHE_TTL.FIVE_MINUTES,
    );
  }

  @Get('/supply/:token')
  public getTokenSupply(
    @Param('token') token: string,
  ): Promise<TrackerSupplyGraphPointDto[]> {
    return this.cacheManager.wrap(
      `${CACHE_KEYS.SUPPLY}-${token}`,
      () => this.trackerService.getTokenSupplyData(token),
      CACHE_TTL.ONE_HOUR,
    );
  }

  //FIXME: Deprecated
  @Get()
  public getTrackerDataPSWAP(): Promise<TrackerDto> {
    return this.getTrackerData('PSWAP');
  }
}
