import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterCurrentPriceTable1710250463626 implements MigrationInterface {
  name = 'alterCurrentPriceTable1710250463626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `current_price` MODIFY COLUMN `market_cap` bigint NOT NULL DEFAULT '0'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `current_price` MODIFY COLUMN `market_cap` bigint NOT NULL',
    );
  }
}
