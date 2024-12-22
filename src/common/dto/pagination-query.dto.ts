import { Type } from 'class-transformer';
import { IsPositive, IsString, Min } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsPositive()
  @Min(1)
  per_page: number = 20;

  @IsString()
  sort: string = 'desc';
}
