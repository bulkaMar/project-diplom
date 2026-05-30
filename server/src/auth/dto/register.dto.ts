import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Введіть коректний email' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'Пароль має бути не менше 6 символів' })
    password: string;
}

export class RegisterDto {
    @IsEmail({}, { message: 'Введіть коректний email' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'Пароль має бути не менше 8 символів' })
    @MaxLength(64, { message: 'Пароль занадто довгий' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'Пароль має містити мінімум одну велику літеру, одну малу та одну цифру',
    })
    password: string;

    @IsString()
    @MinLength(2, { message: 'Ім\'я має бути не менше 2 символів' })
    @MaxLength(50, { message: 'Ім\'я занадто довге' })
    name: string;

    @IsOptional()
    @IsString()
    @Matches(/^[ІІПЗІПЗІПЗA-ZА-Я]{2,6}-\d{2}$/i, {
        message: 'Номер групи має бути у форматі ІПЗ-13 (наприклад: ІПЗ-23)',
    })
    groupName?: string;
}

