import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from './prisma.service';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, AuthGuard, RolesGuard],
  exports: [AuthGuard, RolesGuard, AuthService, PrismaService],
})
export class AuthModule {}
