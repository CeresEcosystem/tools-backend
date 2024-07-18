import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrackerSupply1721330115421 implements MigrationInterface {
  name = 'AddTrackerSupply1721330115421';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `tracker` ADD `supply` varchar(255) DEFAULT 0',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `tracker` DROP COLUMN `supply`');
  }
}
