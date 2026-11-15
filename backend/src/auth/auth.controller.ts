import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CurrentUser } from '../common/current-user.decorator';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from './auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) { return this.authService.register(dto); }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: UserEntity): UserEntity { return user; }

  @Patch('profile')
  @UseGuards(AuthGuard)
  updateProfile(@CurrentUser() user: UserEntity, @Body() dto: UpdateProfileDto): Promise<UserEntity> {
    return this.authService.updateProfile(user, dto);
  }

  @Post('admins')
  @UseGuards(AuthGuard)
  createAdmin(@CurrentUser() user: UserEntity, @Body() dto: CreateAdminDto) {
    return this.authService.createAdmin(user, dto);
  }
}
