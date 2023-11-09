import { MigrationInterface, QueryRunner } from 'typeorm';

export class createDeviceFavoritesTable1699441924982
  implements MigrationInterface
{
  name = 'createDeviceFavoritesTable1699441924982';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS \`user_device\` (\`id\` int NOT NULL AUTO_INCREMENT, \`device_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS \`device_favorite_tokens\` (\`userDeviceId\` int NOT NULL, \`currentPriceId\` int NOT NULL, INDEX \`IDX_e79e11c2e7b1d6adcbae13e449\` (\`userDeviceId\`), INDEX \`IDX_1d1300323582900fcc5a8b5708\` (\`currentPriceId\`), PRIMARY KEY (\`userDeviceId\`, \`currentPriceId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`device_favorite_tokens\` ADD CONSTRAINT \`FK_e79e11c2e7b1d6adcbae13e4495\` FOREIGN KEY (\`userDeviceId\`) REFERENCES \`user_device\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`device_favorite_tokens\` ADD CONSTRAINT \`FK_1d1300323582900fcc5a8b57081\` FOREIGN KEY (\`currentPriceId\`) REFERENCES \`current_price\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`device_favorite_tokens\` DROP FOREIGN KEY \`FK_1d1300323582900fcc5a8b57081\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`device_favorite_tokens\` DROP FOREIGN KEY \`FK_e79e11c2e7b1d6adcbae13e4495\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1d1300323582900fcc5a8b5708\` ON \`device_favorite_tokens\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e79e11c2e7b1d6adcbae13e449\` ON \`device_favorite_tokens\``,
    );
    await queryRunner.query(`DROP TABLE \`device_favorite_tokens\``);
    await queryRunner.query(`DROP TABLE \`user_device\``);
  }
}
