import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterTrackerSummaryTable1706646422100
  implements MigrationInterface
{
  name = 'alterTrackerSummaryTable1706646422100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `tracker_summary` MODIFY COLUMN `gross_burn` decimal(16,2) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `tracker_summary` MODIFY COLUMN `net_burn` decimal(16,2) NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `tracker_summary` MODIFY COLUMN `net_burn` float NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `tracker_summary` MODIFY COLUMN `gross_burn` float NOT NULL',
    );
  }
}
