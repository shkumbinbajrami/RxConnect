import { IsDefined, IsInt, IsUUID, Min } from 'class-validator';

export class AddStockDto {
  @IsDefined()
  @IsUUID()
  medicineId: string;

  @IsDefined()
  @IsInt()
  @Min(0)
  quantity: number;
}
