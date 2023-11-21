import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLiquidityPair1678308272423 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS liquidity_pair (
            id bigint unsigned NOT NULL AUTO_INCREMENT,
            base_asset varchar(16) NOT NULL,
            base_asset_full_name varchar(128) DEFAULT NULL,
            base_asset_id varchar(250) NOT NULL,
            token varchar(16) NOT NULL,
            token_full_name varchar(128) DEFAULT NULL,
            token_asset_id varchar(250) NOT NULL,
            liquidity float NOT NULL DEFAULT 0,
            base_asset_liq float NOT NULL DEFAULT 0,
            target_asset_liq float NOT NULL DEFAULT 0,
            locked_liquidity float NOT NULL DEFAULT 0,
            volume float NOT NULL DEFAULT 0,
            \`order\` smallint NOT NULL DEFAULT 0,
            deleted tinyint(1) NOT NULL DEFAULT 0,
            updated_at datetime NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY base_asset_token_UN (base_asset, token)
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE liquidity_pair');
  }
}
