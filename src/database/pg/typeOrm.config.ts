import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { CreatePrices1678473271465 } from './migrations/1678473271465-create-prices';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('PG_HOST'),
  port: configService.get('PG_PORT'),
  username: configService.get('PG_USER'),
  password: configService.get('PG_PASSWORD'),
  database: configService.get('PG_DB_NAME'),
  entities: [],
  migrations: [CreatePrices1678473271465],
  migrationsTableName: 'migrations',
});