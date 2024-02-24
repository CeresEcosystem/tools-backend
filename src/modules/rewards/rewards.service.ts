import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyValueData } from './key-value-data.entity';
import { FARMING_APR_KEY, FARMING_REWARDS_KEY } from './rewards.constants';
import { RewardsDto } from './rewards.dto';
import { twoNonZeroDecimals } from 'src/utils/number-utils';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(KeyValueData)
    private readonly keyValueRepository: Repository<KeyValueData>,
  ) {}

  public async getRewards(): Promise<RewardsDto> {
    const farmingApr = await this.keyValueRepository.findOneBy({
      id: FARMING_APR_KEY,
    });
    const farmingRewards = await this.keyValueRepository.findOneBy({
      id: FARMING_REWARDS_KEY,
    });
    const apr = Number(farmingApr.value);
    const rewards = Number(farmingRewards.value);

    return {
      apr: this.formatNumber(apr),
      rewards: this.formatNumber(rewards),
      aprDouble: this.formatNumber(apr * 2),
      rewardsDouble: this.formatNumber(rewards * 2),
    };
  }

  public save(apr: number, rewards: number): void {
    this.upsertKeyValue(FARMING_APR_KEY, apr);
    this.upsertKeyValue(FARMING_REWARDS_KEY, rewards);
  }

  private async upsertKeyValue(key: string, value: number): Promise<void> {
    const existingKey = await this.keyValueRepository.findOneBy({ id: key });
    const valueStr = value.toString();

    if (!existingKey) {
      this.keyValueRepository.insert({
        id: key,
        value: valueStr,
        updatedAt: new Date(),
      });

      return;
    }

    if (existingKey.value !== valueStr) {
      this.keyValueRepository.update(
        { id: key },
        {
          value: valueStr,
          updatedAt: new Date(),
        },
      );
    }
  }

  private formatNumber(value: number): string {
    return value < 1 ? twoNonZeroDecimals(value).toString() : value.toFixed(2);
  }
}
