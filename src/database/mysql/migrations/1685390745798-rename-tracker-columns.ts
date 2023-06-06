import { MigrationInterface, QueryRunner } from 'typeorm';

const TRACKER_TABLE = 'tracker';

export class RenameTrackerColumns1685390745798 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn(
      TRACKER_TABLE,
      'pswap_gross_burn',
      'gross_burn',
    );
    await queryRunner.renameColumn(TRACKER_TABLE, 'pswap_net_burn', 'net_burn');
    await queryRunner.renameColumn(
      TRACKER_TABLE,
      'pswap_reminted_lp',
      'reminted_lp',
    );
    await queryRunner.renameColumn(
      TRACKER_TABLE,
      'pswap_reminted_parliament',
      'reminted_parliament',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn(
      TRACKER_TABLE,
      'gross_burn',
      'pswap_gross_burn',
    );
    await queryRunner.renameColumn(TRACKER_TABLE, 'net_burn', 'pswap_net_burn');
    await queryRunner.renameColumn(
      TRACKER_TABLE,
      'reminted_lp',
      'pswap_reminted_lp',
    );
    await queryRunner.renameColumn(
      TRACKER_TABLE,
      'reminted_parliament',
      'pswap_reminted_parliament',
    );
  }
}
