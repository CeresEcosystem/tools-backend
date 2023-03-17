import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { KeyValueData } from './key-value-data.entity';
import {
  FARMING_APR_KEY,
  FARMING_APR_DOUBLE_KEY,
  FARMING_REWARDS_KEY,
  FARMING_REWARDS_DOUBLE_KEY,
} from './rewards.constants';
import { RewardsDto } from './rewards.dto';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(
    @InjectRepository(KeyValueData)
    private readonly keyValueRepository: Repository<KeyValueData>,
  ) {}

  public async getRewards(): Promise<RewardsDto> {
    const rewards = await this.keyValueRepository.findBy({
      id: In([
        FARMING_APR_KEY,
        FARMING_REWARDS_KEY,
        FARMING_APR_DOUBLE_KEY,
        FARMING_REWARDS_DOUBLE_KEY,
      ]),
    });
    const rewardsById = new Map(
      rewards.map((reward) => [reward.id, reward.value]),
    );

    return {
      apr: rewardsById.get(FARMING_APR_KEY),
      rewards: rewardsById.get(FARMING_REWARDS_KEY),
      aprDouble: rewardsById.get(FARMING_APR_DOUBLE_KEY),
      rewardsDouble: rewardsById.get(FARMING_REWARDS_DOUBLE_KEY),
    };
  }

  public async save(rewards: RewardsDto): Promise<void> {
    this.upsertKeyValue(FARMING_APR_KEY, rewards.apr);
    this.upsertKeyValue(FARMING_REWARDS_KEY, rewards.rewards);
    this.upsertKeyValue(FARMING_APR_DOUBLE_KEY, rewards.aprDouble);
    this.upsertKeyValue(FARMING_REWARDS_DOUBLE_KEY, rewards.rewardsDouble);
  }

  private async upsertKeyValue(key: string, value: string) {
    const existingKey = await this.keyValueRepository.findOneBy({ id: key });

    if (!existingKey) {
      this.keyValueRepository.insert({
        id: key,
        value,
        updatedAt: new Date(),
      });

      return;
    }

    if (existingKey.value != value) {
      this.keyValueRepository.update(
        { id: key },
        {
          value,
          updatedAt: new Date(),
        },
      );
    }
  }
}
