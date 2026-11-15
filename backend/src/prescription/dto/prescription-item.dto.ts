import { IsInt, IsNotEmpty, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class PrescriptionItemDto {
  @IsUUID()
  medicineId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  dosageInstructions: string;
}
