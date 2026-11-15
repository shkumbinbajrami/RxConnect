import { IsDefined, IsEmail } from 'class-validator';

export class CreateAdminDto {
  @IsDefined()
  @IsEmail()
  email: string;
}
