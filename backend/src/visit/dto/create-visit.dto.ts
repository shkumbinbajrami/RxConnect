import { IsISO8601, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateVisitDto {
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  scheduledAt: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes: string;
}
