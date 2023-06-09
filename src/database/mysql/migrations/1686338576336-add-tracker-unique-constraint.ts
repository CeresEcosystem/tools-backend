import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrackerUniqueConstraint1686338576336
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tracker \
        ADD CONSTRAINT tracker_unique UNIQUE KEY (token, block_num)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE tracker DROP INDEX tracker_unique`);
  }
}
