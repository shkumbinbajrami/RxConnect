import { DispenseStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

export class ListDispensesDto extends ListQueryDto {
  @IsOptional()
  @IsEnum(DispenseStatus)
  status: DispenseStatus;
}
