import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddValTrackerColumn1685471203007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tracker \
       ADD COLUMN xor_dedicated_for_buy_back FLOAT DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tracker \
       DROP COLUMN xor_dedicated_for_buy_back`,
    );
  }
}
