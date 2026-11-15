import { Role } from '@prisma/client';
import { IsDefined, IsEmail, IsEnum, IsString, MinLength, NotEquals } from 'class-validator';

export class RegisterDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsString()
  @MinLength(8)
  password: string;

  @IsDefined()
  @IsEnum(Role)
  @NotEquals(Role.ADMIN)
  role: Role;
}
