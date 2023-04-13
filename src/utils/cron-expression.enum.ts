import { CronExpression as ScheduleCronExpression } from '@nestjs/schedule';

export const CronExpression = {
  ...ScheduleCronExpression,
  EVERY_2_MINUTES: '0 */2 * * * *',
  EVERY_3_MINUTES: '0 */3 * * * *',
};
