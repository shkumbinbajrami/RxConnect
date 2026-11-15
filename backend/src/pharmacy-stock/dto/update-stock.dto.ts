import { IsDefined, IsInt, Min } from 'class-validator';

export class UpdateStockDto {
  @IsDefined()
  @IsInt()
  @Min(0)
  quantity: number;
}
