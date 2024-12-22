import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Unique } from 'src/common/validator/unique.validator';
import { UserType } from '../users.types';
import { Exist } from 'src/common/validator/exist.validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @Exist({ model: 'role', column: 'id' })
  @Type(() => Number)
  @IsNumber()
  role_id: number;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(50)
  @Unique({ model: 'user', column: 'email' })
  email: string;

  @IsString()
  @MaxLength(100)
  password: string;

  @IsString()
  @IsOptional()
  @IsEnum(UserType)
  type: UserType;
}
