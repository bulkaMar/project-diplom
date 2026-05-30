import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(2, { message: "Ім'я має бути не менше 2 символів" })
    @MaxLength(50)
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Введіть коректний email' })
    email?: string;
}

