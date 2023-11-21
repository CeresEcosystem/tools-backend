import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CACHE_KEYS, CACHE_TTL } from './rewards.constants';
import { RewardsService } from './rewards.service';
import { RewardsDto } from './rewards.dto';

@Controller('rewards')
@ApiTags('Rewards Controller')
export class RewardsController {
  constructor(
    private readonly rewardsService: RewardsService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Get()
  public getRewards(): Promise<RewardsDto> {
    return this.cacheManager.wrap(
      CACHE_KEYS.REWARDS,
      () => this.rewardsService.getRewards(),
      CACHE_TTL.ONE_MINUTE,
    );
  }
}
