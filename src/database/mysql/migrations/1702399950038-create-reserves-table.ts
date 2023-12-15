import { MigrationInterface, QueryRunner } from 'typeorm';

export class createReservesTable1702399950038 implements MigrationInterface {
  name = 'createReservesTable1702399950038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`reserves\` (
            \`id\` int NOT NULL AUTO_INCREMENT, 
            \`token_name\` varchar(255) NOT NULL, 
            \`token_symbol\` varchar(255) NOT NULL, 
            \`balance\` int NOT NULL, 
            \`value\` float NOT NULL, 
            \`updated_at\` timestamp NOT NULL, 
            PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `reserves`');
  }
}
