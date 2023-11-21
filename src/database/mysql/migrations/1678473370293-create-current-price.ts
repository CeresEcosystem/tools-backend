import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCurrentPrice1678473370293 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS current_price ( \
            id bigint unsigned NOT NULL AUTO_INCREMENT, \
            token varchar(16) NOT NULL, \
            price float NOT NULL DEFAULT '0', \
            asset_id varchar(250) NOT NULL, \
            full_name varchar(128) NOT NULL, \
            \`order\` smallint NOT NULL DEFAULT '0', \
            locked_tokens float NOT NULL DEFAULT '0', \
            deleted tinyint(1) NOT NULL DEFAULT '0', \
            updated_at datetime NOT NULL, \
            PRIMARY KEY (id), \
            UNIQUE KEY token (token)
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE current_price');
  }
}
