import { Type } from 'class-transformer';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { PrescriptionItemDto } from './prescription-item.dto';

export class CreatePrescriptionDto {
  @IsUUID()
  visitId: string;

  @IsOptional()
  @IsUUID()
  replacesId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique((item: PrescriptionItemDto) => item.medicineId)
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];
}
