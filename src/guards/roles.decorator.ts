import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { Role } from 'src/modules/auth/user-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
