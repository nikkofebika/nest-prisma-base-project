import { IsEmail, IsString, Max, MaxLength, MinLength } from "class-validator"
import { Unique } from "src/common/validator/unique.validator"

export class RegisterDto {
    @IsString()
    @MaxLength(100)
    name: string

    @IsEmail()
    @MaxLength(100)
    @Unique({ model: 'user', column: 'email' })
    email: string

    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string
}