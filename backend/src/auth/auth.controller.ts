import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) { return this.authService.register(dto); }

  @Get('me')
  me(@Headers('authorization') authorization?: string) { return this.authService.current(authorization); }

  @Post('admins')
  createAdmin(@Headers('authorization') authorization: string | undefined, @Body() dto: CreateAdminDto) {
    return this.authService.createAdmin(authorization, dto);
  }
}
