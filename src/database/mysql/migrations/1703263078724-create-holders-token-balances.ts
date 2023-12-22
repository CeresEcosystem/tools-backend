import { MigrationInterface, QueryRunner } from 'typeorm';

export class createHoldersTokenBalances1703263078724
  implements MigrationInterface
{
  name = 'createHoldersTokenBalances1703263078724';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`holders\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`holder\` varchar(255) NOT NULL, 
            \`token\` varchar(255) NOT NULL, 
            \`balance\` float NOT NULL, 
            UNIQUE INDEX \`IDX_3eabafcedac5fc2da14f2428c1\` (\`holder\`, \`token\`),
            PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_3eabafcedac5fc2da14f2428c1` ON `holders`',
    );
    await queryRunner.query('DROP TABLE `holders`');
  }
}
