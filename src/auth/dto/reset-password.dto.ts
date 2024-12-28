import { IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from 'src/common/validator/match.validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string

  @Match('password')
  @MinLength(8)
  @MaxLength(100)
  password_confirmation: string
}
