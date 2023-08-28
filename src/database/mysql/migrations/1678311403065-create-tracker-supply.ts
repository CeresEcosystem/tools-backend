import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrackerSupply1678311403065 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS tracker_supply ( \
            id bigint NOT NULL AUTO_INCREMENT, \
            date_raw date NOT NULL, \
            supply varchar(60) DEFAULT '0', \
            created_at datetime DEFAULT NULL, \
            updated_at datetime DEFAULT NULL, \
            PRIMARY KEY (id) \
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE tracker_supply`);
  }
}
