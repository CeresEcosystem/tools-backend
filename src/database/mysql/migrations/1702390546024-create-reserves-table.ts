import { MigrationInterface, QueryRunner } from 'typeorm';

export class createReservesTable1702390546024 implements MigrationInterface {
  name = 'createReservesTable1702390546024';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`reserve\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`address\` varchar(255) NOT NULL, 
            \`token_name\` varchar(255) NOT NULL, 
            \`token_symbol\` varchar(255) NOT NULL, 
            \`balance\` int NOT NULL, 
            \`value\` float NOT NULL, 
            PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`reserve\``);
  }
}
