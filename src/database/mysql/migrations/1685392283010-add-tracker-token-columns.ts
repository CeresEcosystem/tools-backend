import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrackerTokenColumns1685392283010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tracker \
       ADD COLUMN token VARCHAR(16),
       ADD INDEX token_idx(token),
       ADD INDEX block_num_idx(block_num),
       DROP INDEX block_num_UNIQUE`,
    );
    await queryRunner.query(
      `ALTER TABLE tracker_supply \
       ADD COLUMN token VARCHAR(16),
       ADD INDEX token_idx(token),
       ADD CONSTRAINT tracker_supply_unique UNIQUE KEY (token, date_raw)`,
    );

    await queryRunner.query(`UPDATE tracker SET token = 'PSWAP'`);
    await queryRunner.query(`UPDATE tracker_supply SET token = 'PSWAP'`);

    await queryRunner.query(
      `ALTER TABLE tracker \
       MODIFY COLUMN token VARCHAR(16) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE tracker_supply \
       MODIFY COLUMN token VARCHAR(16) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tracker \
       DROP COLUMN token,
       DROP INDEX block_num_idx,
       ADD INDEX block_num_UNIQUE(block_num)`,
    );
    await queryRunner.query(
      `ALTER TABLE tracker_supply \
       DROP COLUMN token,
       DROP INDEX tracker_supply_unique`,
    );
  }
}
