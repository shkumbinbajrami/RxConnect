import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReverseDispenseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
