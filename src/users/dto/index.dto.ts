import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class IndexDto extends PartialType(PaginationQueryDto) {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email: string;
}
