import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterPairPeriodicLiquidityChange1705659813226
  implements MigrationInterface
{
  name = 'alterPairPeriodicLiquidityChange1705659813226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `pairs_periodic_liquidity_change` ADD `base_asset_liquidity` float NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `pairs_periodic_liquidity_change` ADD `token_asset_liquidity` float NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `pairs_periodic_liquidity_change` DROP COLUMN `token_asset_liquidity`',
    );
    await queryRunner.query(
      'ALTER TABLE `pairs_periodic_liquidity_change` DROP COLUMN `base_asset_liquidity`',
    );
  }
}
