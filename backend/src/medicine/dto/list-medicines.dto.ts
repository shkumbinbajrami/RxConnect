import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ListQueryDto } from '../../common/dto/list-query.dto';

export class ListMedicinesDto extends ListQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsBoolean()
  isActive: boolean;
}
