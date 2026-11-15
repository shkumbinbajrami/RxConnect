import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { ROLES_KEY, RolesGuard } from './guards/roles.guard';

export function RoleGuard(...roles: Role[]): ClassDecorator & MethodDecorator {
  return applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(AuthGuard, RolesGuard));
}
