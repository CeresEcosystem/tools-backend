import { MigrationInterface, QueryRunner } from 'typeorm';

export class createPairsLiquidityChanges1696322819786
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS pairs_liquidity_changes ( \
            id bigint unsigned NOT NULL AUTO_INCREMENT, \
            first_asset_id varchar(128) NOT NULL, \
            second_asset_id varchar(128) NOT NULL, \
            first_asset_amount varchar(256) NOT NULL, \
            second_asset_amount varchar(256) NOT NULL, \
            type varchar(16) NOT NULL, \
            timestamp int NOT NULL, \
            PRIMARY KEY (id) \
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE pairs_liquidity_changes`);
  }
}
