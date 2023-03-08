import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { CreateLiquidityPair1678308272423 } from './migrations/1678308272423-create-liquidity-pair';

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
  migrations: [CreateLiquidityPair1678308272423],
  migrationsTableName: 'migrations_tools',
});
