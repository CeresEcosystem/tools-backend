import { CronExpression as ScheduleCronExpression } from '@nestjs/schedule';

export const CronExpression = {
  ...ScheduleCronExpression,
  EVERY_3_MINUTES: '0 */3 * * * *',
};
