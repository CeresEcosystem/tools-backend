import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterCurrentPriceTable1706183255362 implements MigrationInterface {
  name = 'alterCurrentPriceTable1706183255362';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`current_price\` ADD \`market_cap\` bigint NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`current_price\` DROP COLUMN \`market_cap\``,
    );
  }
}
