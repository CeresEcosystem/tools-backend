import { MigrationInterface, QueryRunner } from 'typeorm';

export class createPairsVolumeChange1710775143192
  implements MigrationInterface
{
  name = 'createPairsVolumeChange1710775143192';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`pairs_volume_changes\` (
          \`id\` int NOT NULL AUTO_INCREMENT, 
          \`token_asset_id\` varchar(255) NOT NULL, 
          \`base_asset_id\` varchar(255) NOT NULL, 
          \`volume\` int NOT NULL, 
          \`timestamp\` timestamp NOT NULL, 
          PRIMARY KEY (\`id\`)
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `pairs_volume_changes`');
  }
}
