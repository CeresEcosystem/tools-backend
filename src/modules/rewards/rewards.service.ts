import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyValueData } from './key-value-data.entity';
import { FARMING_APR_KEY, FARMING_REWARDS_KEY } from './rewards.constants';
import { RewardsDto } from './rewards.dto';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(KeyValueData)
    private readonly keyValueRepository: Repository<KeyValueData>,
  ) {}

  public async getRewards(): Promise<RewardsDto> {
    const { value: apr } = await this.keyValueRepository.findOneBy({
      id: FARMING_APR_KEY,
    });
    const { value: rewards } = await this.keyValueRepository.findOneBy({
      id: FARMING_REWARDS_KEY,
    });

    return {
      apr,
      rewards,
      aprDouble: (Number(apr) * 2).toFixed(2),
      rewardsDouble: (Number(rewards) * 2).toFixed(2),
    };
  }

  public save(apr: string, rewards: string): void {
    this.upsertKeyValue(FARMING_APR_KEY, apr);
    this.upsertKeyValue(FARMING_REWARDS_KEY, rewards);
  }

  private async upsertKeyValue(key: string, value: string): Promise<void> {
    const existingKey = await this.keyValueRepository.findOneBy({ id: key });

    if (!existingKey) {
      this.keyValueRepository.insert({
        id: key,
        value,
        updatedAt: new Date(),
      });

      return;
    }

    if (existingKey.value !== value) {
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
