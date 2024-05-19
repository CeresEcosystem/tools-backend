import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pair } from './entity/pairs.entity';
import { PairsSync } from './pairs.sync';
import { PairsMapper } from './mapper/pairs.mapper';
import { PairsRepository } from './pairs.repository';
import { PairsService } from './pairs.service';
import { TokenPriceModule } from '../token-price/token-price.module';
import { PairsController } from './pairs.controller';
import { CeresClientModule } from '../ceres-client/ceres-client.module';
import { PairsLockerSync } from './pairs-locker.sync';
import { PairsVolumeChangeEntity } from './entity/pairs-volume-change.entity';
import { PairsVolumeChangeRepository } from './pairs-volume.repository';
import { PairsVolumeChangeDtoToEntityMapper } from './mapper/pairs-volume-change-dto-to-entity.mapper';
import { SoraClientModule } from '@ceresecosystem/ceres-lib/packages/ceres-backend-common';

@Module({
  imports: [
    HttpModule,
    TokenPriceModule,
    CeresClientModule,
    SoraClientModule,
    TypeOrmModule.forFeature([Pair, PairsVolumeChangeEntity]),
  ],
  controllers: [PairsController],
  providers: [
    PairsService,
    PairsMapper,
    PairsVolumeChangeDtoToEntityMapper,
    PairsRepository,
    PairsVolumeChangeRepository,
    PairsSync,
    PairsLockerSync,
  ],
  exports: [PairsService],
})
export class PairsModule {}
