import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameKensetsuBurn1708459770154 implements MigrationInterface {
  name = 'renameKensetsuBurn1708459770154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('RENAME TABLE `kensetsu-burn` TO `kensetsu_burn`');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('RENAME TABLE `kensetsu_burn` TO `kensetsu-burn`');
  }
}
