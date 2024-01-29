import {
  Controller,
  Get,
  Inject,
  Param,
  ParseEnumPipe,
  Query,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import {
  TrackerBlockDto,
  TrackerDto,
  TrackerSupplyGraphPointDto,
  TrackerV2Dto,
} from './dto/tracker.dto';
import { CACHE_KEYS, CACHE_TTL } from './tracker.constants';
import { TrackerService } from './tracker.service';
import { PageOptionsDto } from 'src/utils/pagination/page-options.dto';
import { PageDto } from 'src/utils/pagination/page.dto';
import { BurnType } from './entity/tracker.entity';

@Controller('tracker')
@ApiTags('Tracker Controller')
export class TrackerController {
  constructor(
    private readonly trackerService: TrackerService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Get('/v2/:token')
  public getTrackerDataV2(
    @Param('token') token: string,
  ): Promise<TrackerV2Dto> {
    return this.cacheManager.wrap(
      `${CACHE_KEYS.TRACKER_V2}-${token}`,
      () => this.trackerService.getTrackerDataV2(token),
      CACHE_TTL.FIVE_MINUTES,
    );
  }

  @Get('/:token/blocks/:burnType')
  public getBlocks(
    @Param('token') token: string,
    @Param('burnType', new ParseEnumPipe(BurnType)) burnType: BurnType,
    @Query() pageOptions: PageOptionsDto,
  ): Promise<PageDto<TrackerBlockDto>> {
    return this.trackerService.findAll(token, burnType, pageOptions);
  }

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
