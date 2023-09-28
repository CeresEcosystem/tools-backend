import {
  Controller,
  Get,
  Inject,
  Logger,
  Param,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { TrackerDto, TrackerSupplyGraphPointDto } from './dto/tracker.dto';
import { CACHE_KEYS, CACHE_TTL } from './tracker.constants';
import { TrackerService } from './tracker.service';

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
    return this.cacheManager.wrap(
      `${CACHE_KEYS.TRACKER}-${token}`,
      () => this.trackerService.getTrackerData(token),
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
}
