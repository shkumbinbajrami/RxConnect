import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import type { AuthenticatedRequest } from '../current-user.decorator';

export const ROLES_KEY = 'allowed_roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;
    if (!user || !roles?.includes(user.role)) throw new ForbiddenException('Your role cannot access this endpoint');
    return true;
  }
}
