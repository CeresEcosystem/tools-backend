import { MigrationInterface, QueryRunner } from 'typeorm';

export class createHoldersTokenBalances1703589565543
  implements MigrationInterface
{
  name = 'createHoldersTokenBalances1703589565543';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`holders\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`holder\` varchar(50) NOT NULL, 
            \`asset_id\` varchar(70) NOT NULL, 
            \`balance\` float NOT NULL, 
            UNIQUE INDEX \`IDX_3a60adff08762eeae0328ad868\` (\`holder\`, \`asset_id\`), 
            PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_3a60adff08762eeae0328ad868` ON `holders`',
    );
    await queryRunner.query('DROP TABLE `holders`');
  }
}
