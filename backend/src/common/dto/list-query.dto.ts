import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search: string;
}

export type Paginated<T> = { items: T[]; page: number; limit: number; total: number; totalPages: number };
export type ListResult<T> = T[] | Paginated<T>;

export function pagination(query: ListQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  return { page, limit, skip: (page - 1) * limit, enabled: query.page !== undefined || query.limit !== undefined };
}

export function listResult<T>(items: T[], total: number, query: ListQueryDto): ListResult<T> {
  const { page, limit, enabled } = pagination(query);
  return enabled ? { items, page, limit, total, totalPages: Math.ceil(total / limit) } : items;
}
