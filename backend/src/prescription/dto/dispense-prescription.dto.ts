import { Type } from 'class-transformer';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { LookupPrescriptionDto } from './lookup-prescription.dto';

export class DispenseLineDto {
  @IsUUID()
  prescriptionItemId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class DispensePrescriptionDto extends LookupPrescriptionDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique((item: DispenseLineDto) => item.prescriptionItemId)
  @ValidateNested({ each: true })
  @Type(() => DispenseLineDto)
  items: DispenseLineDto[];
}
