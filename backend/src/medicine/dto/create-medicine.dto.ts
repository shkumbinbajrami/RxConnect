import { IsBoolean, IsDefined, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

export class CreateMedicineDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'name cannot be blank' })
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  strength: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  form: string | null;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'unit cannot be blank' })
  @MaxLength(40)
  unit: string;

  @IsDefined()
  @IsString()
  @Matches(/^(0|[1-9]\d{0,7})(\.\d{1,2})?$/, { message: 'price must be a nonnegative amount with at most two decimals' })
  price: string;

  @IsDefined()
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a three-letter uppercase code' })
  currency: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  isActive: boolean;
}
