import { PrescriptionStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

export class ListPrescriptionsDto extends ListQueryDto {
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status: PrescriptionStatus;

  @IsOptional()
  @IsUUID()
  visitId: string;
}
