import { VisitStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

export class ListVisitsDto extends ListQueryDto {
  @IsOptional()
  @IsEnum(VisitStatus)
  status: VisitStatus;

  @IsOptional()
  @IsUUID()
  patientId: string;
}
