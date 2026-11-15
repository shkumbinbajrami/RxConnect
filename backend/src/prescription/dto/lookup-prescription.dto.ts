import { IsOptional, IsString, MaxLength } from 'class-validator';

export class LookupPrescriptionDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  qrToken: string;
}
