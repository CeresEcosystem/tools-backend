import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeTransfer1720011653258 implements MigrationInterface {
  name = 'AddTypeTransfer1720011653258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `transfer` ADD `type` varchar(15) NOT NULL, ADD `direction` enum ('burned', 'minted')",
    );

    await queryRunner.query(`
        UPDATE \`transfer\`
        SET \`type\` = CASE
          WHEN \`sender_account_id\` LIKE '0x%' OR \`receiver_account_id\` LIKE '0x%' THEN 'ETH'
          ELSE 'Sora'
        END
      `);

    await queryRunner.query(`
        UPDATE \`transfer\`
        SET \`direction\` = CASE
          WHEN \`type\` = 'ETH' AND \`sender_account_id\` LIKE '0x%' THEN 'minted'
          WHEN \`type\` = 'ETH' AND \`receiver_account_id\` LIKE '0x%' THEN 'burned'
          ELSE NULL
        END
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `transfer` DROP COLUMN `direction`, DROP COLUMN `type`',
    );
  }
}
