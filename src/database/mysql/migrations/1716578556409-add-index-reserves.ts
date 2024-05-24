import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexReserves1716578556409 implements MigrationInterface {
  name = 'addIndexReserves1716578556409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX `IDX_efdfd01f137904ac56e8236ab3` ON `reserves` (`token_symbol`)',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_206c78336743d677f3918ea7bf` ON `reserves` (`updated_at`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_206c78336743d677f3918ea7bf` ON `reserves`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_efdfd01f137904ac56e8236ab3` ON `reserves`',
    );
  }
}
