import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUpdatedAtHolders1712175568724 implements MigrationInterface {
  name = 'addUpdatedAtHolders1712175568724';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `holders` ADD `updated_at` timestamp NOT NULL',
    );
    await queryRunner.query(
      'CREATE INDEX `updatedAt` ON `holders` (updated_at)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `holders` DROP COLUMN `updated_at`');
    await queryRunner.query('DROP INDEX `updatedAt` ON `holders`');
  }
}
