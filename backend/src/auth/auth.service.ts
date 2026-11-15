import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { CreateAdminDto } from './dto/create-admin.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserEntity } from './entities/user.entity';
import { PrismaService } from './prisma.service';

const profiles = { doctorProfile: true, farmacyProfile: true, patientProfile: true } as const;

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
      const user = await this.prisma.user.create({
        data: {
          id: data.user.id,
          email,
          role,
          verified: true,
          ...(role === Role.DOCTOR && { doctorProfile: { create: {} } }),
          ...(role === Role.FARMACY && { farmacyProfile: { create: {} } }),
          ...(role === Role.PATIENT && { patientProfile: { create: {} } }),
        },
        include: profiles,
      });
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
    const user = await this.prisma.user.findUnique({ where: { id: data.user.id }, include: profiles });
    if (!user || !user.verified) throw new ForbiddenException('User is not verified');
    return new UserEntity(user);
  }

  async createAdmin(actor: UserEntity, dto: CreateAdminDto): Promise<UserEntity> {
    if (actor.role !== Role.ADMIN) throw new ForbiddenException();
    return this.create(dto.email, Role.ADMIN);
  }

  async updateProfile(actor: UserEntity, dto: UpdateProfileDto): Promise<UserEntity> {
    if (actor.role === Role.ADMIN) throw new ForbiddenException('Admins do not have a role profile');

    const allowed = actor.role === Role.DOCTOR
      ? ['fullName', 'specialty', 'licenseNumber', 'workplace']
      : actor.role === Role.FARMACY
        ? ['pharmacyName', 'licenseNumber', 'address', 'phone']
        : ['fullName', 'dateOfBirth', 'phone'];
    const submitted = Object.keys(dto).filter((key) => dto[key as keyof UpdateProfileDto] !== undefined);
    if (submitted.some((key) => !allowed.includes(key))) {
      throw new BadRequestException('Profile fields do not match your role');
    }

    const normalized: Record<string, string | Date | null> = Object.fromEntries(submitted.map((key) => {
      const value = dto[key as keyof UpdateProfileDto].trim();
      return [key, value === '' ? null : value];
    }));
    if (actor.role === Role.PATIENT && normalized.dateOfBirth) {
      const date = new Date(`${normalized.dateOfBirth}T00:00:00.000Z`);
      if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== normalized.dateOfBirth) {
        throw new BadRequestException('dateOfBirth is not a valid date');
      }
      normalized.dateOfBirth = date;
    }

    const data = actor.role === Role.DOCTOR
      ? { doctorProfile: { upsert: { create: normalized, update: normalized } } }
      : actor.role === Role.FARMACY
        ? { farmacyProfile: { upsert: { create: normalized, update: normalized } } }
        : { patientProfile: { upsert: { create: normalized, update: normalized } } };
    const user = await this.prisma.user.update({ where: { id: actor.id }, data, include: profiles });
    return new UserEntity(user);
  }
}
