import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength } from 'class-validator';
import { Exist } from 'src/common/validator/exist.validator';

export class CreateContactDto {
  @IsInt()
  @Type(() => Number)
  @Exist({ model: 'user', column: 'id' })
  user_id: number;

  @IsString()
  address: string;

  @IsString()
  @MaxLength(10)
  postal_code: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(100)
  country: string;
}
