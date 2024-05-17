import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameTokenBurnTable1715979117619 implements MigrationInterface {
  name = 'renameTokenBurnTable1715979117619';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE kensetsu_burn RENAME token_burn');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE token_burn RENAME kensetsu_burn');
  }
}
