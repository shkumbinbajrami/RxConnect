import { IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @MaxLength(120)
  fullName: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @MaxLength(120)
  specialty: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @MaxLength(80)
  licenseNumber: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @MaxLength(160)
  workplace: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @MaxLength(160)
  pharmacyName: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @MaxLength(240)
  address: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @MaxLength(40)
  phone: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateOfBirth must be YYYY-MM-DD' })
  dateOfBirth: string;
}
