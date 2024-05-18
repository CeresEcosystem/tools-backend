import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('PG_HOST'),
  port: configService.get('PG_PORT'),
  username: configService.get('PG_USER'),
  password: configService.get('PG_PASSWORD'),
  database: configService.get('PG_DB_NAME'),
  entities: [
    'src/modules/volumes/entity/volumes.entity.ts',
    'src/modules/chrono-price/entity/chrono-price-agg.entity.ts',
  ],
  migrations: ['src/database/pg/migrations/*'],
  migrationsTableName: 'migrations',
});
