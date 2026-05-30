import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Введіть коректний email' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'Пароль має бути не менше 6 символів' })
    password: string;
}

