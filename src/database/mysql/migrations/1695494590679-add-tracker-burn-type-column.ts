import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTrackerBurnTypeColumn1695494590679
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE tracker ADD COLUMN burn_type VARCHAR(20) NOT NULL',
    );
    await queryRunner.query("UPDATE tracker SET burn_type = 'FEES'");
    await queryRunner.query('ALTER TABLE tracker DROP INDEX tracker_unique');
    await queryRunner.query(
      'ALTER TABLE tracker ADD CONSTRAINT tracker_unique UNIQUE KEY (token, block_num, burn_type)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE tracker DROP COLUMN burn_type');
  }
}
