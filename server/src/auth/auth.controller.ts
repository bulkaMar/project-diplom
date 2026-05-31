import { Controller, Post, Body, UseGuards, Get, Request, Res, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService,
    ) { }

    @Get('groups')
    async getGroups() {
        return this.authService.getGroups();
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req) {
        return this.authService.findById(req.user.id);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Request() req) { }

    @Get('google/callback')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Request() req, @Res() res: Response) {
        const { access_token } = await this.authService.validateGoogleUser(req.user);
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?token=${access_token}`);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body('email') email: string) {
        await this.authService.forgotPassword(email);
        return { message: 'Якщо акаунт існує, лист із посиланням надіслано' };
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Body('token') token: string,
        @Body('password') password: string,
    ) {
        await this.authService.resetPassword(token, password);
        return { message: 'Пароль успішно змінено' };
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('profile')
    async updateProfile(@Request() req, @Body() updateDto: UpdateProfileDto) {
        return this.authService.updateProfile(req.user.id, updateDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('stats')
    async getStats(@Request() req) {
        return this.authService.getStats(req.user.id);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.TEACHER, Role.ADMIN)
    @Get('teacher-stats')
    async getTeacherStats() {
        return this.authService.getTeacherStats();
    }
}
