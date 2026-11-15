import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { CreateAdminDto } from './dto/create-admin.dto';
import { RegisterDto } from './dto/register.dto';
import { UserEntity } from './entities/user.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuthService {
  private readonly supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto): Promise<UserEntity> {
    if (dto.role === Role.ADMIN) throw new ForbiddenException('Admin registration is restricted');
    return this.create(dto.email, dto.role, dto.password);
  }

  private async create(email: string, role: Role, password?: string): Promise<UserEntity> {
    const { data, error } = password
      ? await this.supabase.auth.admin.createUser({ email, password, email_confirm: true })
      : await this.supabase.auth.admin.inviteUserByEmail(email, {
          redirectTo: `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/login`,
        });
    if (error || !data.user) throw new BadRequestException(error?.message ?? 'Unable to create user');
    try {
      const user = await this.prisma.user.create({ data: { id: data.user.id, email, role, verified: true } });
      return new UserEntity(user);
    } catch (error) {
      await this.supabase.auth.admin.deleteUser(data.user.id);
      throw error;
    }
  }

  async current(authorization?: string): Promise<UserEntity> {
    const token = authorization?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) throw new UnauthorizedException();
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data.user) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({ where: { id: data.user.id } });
    if (!user || !user.verified) throw new ForbiddenException('User is not verified');
    return new UserEntity(user);
  }

  async createAdmin(authorization: string | undefined, dto: CreateAdminDto): Promise<UserEntity> {
    const actor = await this.current(authorization);
    if (actor.role !== Role.ADMIN) throw new ForbiddenException();
    return this.create(dto.email, Role.ADMIN);
  }
}
