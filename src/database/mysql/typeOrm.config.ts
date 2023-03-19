import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { CreateLiquidityPair1678308272423 } from './migrations/1678308272423-create-liquidity-pair';
import { CreateTrackerSupply1678311403065 } from './migrations/1678311403065-create-tracker-supply';
import { CreateTokenOrder1678465924600 } from './migrations/1678465924600-create-token-order';
import { CreateCurrentPrice1678473370293 } from './migrations/1678473370293-create-current-price';
import { CreateSymbols1678568504333 } from './migrations/1678568504333-create-symbols';
import { CreateKeyValueData1679067199053 } from './migrations/1679067199053-create-key-value-data';
import { CreateTracker1679212716812 } from './migrations/1679212716812-create-tracker';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get('MYSQL_HOST'),
  port: configService.get('MYSQL_PORT'),
  username: configService.get('MYSQL_USER'),
  password: configService.get('MYSQL_PASSWORD'),
  database: configService.get('MYSQL_DB_NAME'),
  entities: [],
  migrations: [
    CreateLiquidityPair1678308272423,
    CreateTrackerSupply1678311403065,
    CreateTokenOrder1678465924600,
    CreateCurrentPrice1678473370293,
    CreateSymbols1678568504333,
    CreateKeyValueData1679067199053,
    CreateTracker1679212716812,
  ],
  migrationsTableName: 'migrations_tools',
});
