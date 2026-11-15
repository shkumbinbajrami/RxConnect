import { IsISO8601 } from 'class-validator';

export class IssuePrescriptionDto {
  @IsISO8601({ strict: true })
  expiresAt: string;
}
