import { CACHE_MANAGER, Controller, Get, Inject, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { TrackerDto } from './dto/tracker.dto';
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

  @Get()
  public getTrackerData(): Promise<TrackerDto> {
    return this.cacheManager.wrap(
      CACHE_KEYS.TRACKER,
      () => this.trackerService.getTrackerData(),
      CACHE_TTL.FIVE_MINUTES,
    );
  }
}
