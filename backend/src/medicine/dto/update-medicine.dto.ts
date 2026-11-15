import { IsBoolean, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

export class UpdateMedicineDto {
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @Matches(/\S/, { message: 'name cannot be blank' })
  @MaxLength(160)
  name: string;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(80)
  strength: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(80)
  form: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @Matches(/\S/, { message: 'unit cannot be blank' })
  @MaxLength(40)
  unit: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @Matches(/^(0|[1-9]\d{0,7})(\.\d{1,2})?$/, { message: 'price must be a nonnegative amount with at most two decimals' })
  price: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a three-letter uppercase code' })
  currency: string;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  isActive: boolean;
}
