import { Injectable } from '@nestjs/common';
import { Reserve } from './entity/reserves.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReservesRepository {
  constructor(
    @InjectRepository(Reserve)
    private readonly reserveRepo: Repository<Reserve>,
  ) {}

  public async saveReserve(reserve: Reserve): Promise<Reserve> {
    return this.reserveRepo.save(reserve);
  }

  public async findTokenReserves(tokenSymbol: string): Promise<Reserve[]> {
    return this.reserveRepo.findBy({ tokenSymbol: tokenSymbol });
  }
}
