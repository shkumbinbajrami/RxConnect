import { Type } from 'class-transformer';
import { ArrayNotEmpty, ArrayUnique, IsArray, ValidateNested } from 'class-validator';
import { PrescriptionItemDto } from './prescription-item.dto';

export class UpdatePrescriptionDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique((item: PrescriptionItemDto) => item.medicineId)
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];
}
