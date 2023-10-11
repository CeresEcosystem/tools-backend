import { MigrationInterface, QueryRunner } from 'typeorm';

export class createPairsLiquidityChanges1696322819786
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS pairs_liquidity_changes ( \
            id int NOT NULL AUTO_INCREMENT, \
            block_number bigint NOT NULL, \
            signer_id varchar(128) NOT NULL, \
            first_asset_id varchar(128) NOT NULL, \
            second_asset_id varchar(128) NOT NULL, \
            first_asset_amount varchar(256) NOT NULL, \
            second_asset_amount varchar(256) NOT NULL, \
            transaction_type enum('withdrawLiquidity', 'depositLiquidity') NOT NULL, \
            timestamp bigint NOT NULL, \
            PRIMARY KEY (id), \
            CONSTRAINT non_duplicate_entry UNIQUE (signer_id, first_asset_id, second_asset_id, transaction_type, block_number) \
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE pairs_liquidity_changes`);
  }
}
