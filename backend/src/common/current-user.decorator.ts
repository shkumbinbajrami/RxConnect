import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { UserEntity } from '../auth/entities/user.entity';

export type AuthenticatedRequest = Request & { user: UserEntity };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserEntity =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
