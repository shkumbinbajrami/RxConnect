import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateVisitDto {
  @IsOptional()
  @IsISO8601({ strict: true })
  scheduledAt: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes: string | null;
}
