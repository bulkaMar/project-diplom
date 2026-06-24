import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('users')
    async getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @Get('courses')
    async getAllCourses() {
        return this.adminService.getAllCourses();
    }

    @Get('reviews')
    async getAllReviews() {
        return this.adminService.getAllReviews();
    }

    @Get('stats')
    async getStats() {
        return this.adminService.getStats();
    }

    @Patch('users/:id/role')
    async updateUserRole(
        @Param('id') id: string,
        @Body('role') role: Role,
    ) {
        return this.adminService.updateUserRole(id, role);
    }

    @Post('users/invite')
    async inviteUser(
        @Body('email') email: string,
        @Body('role') role: Role,
    ) {
        return this.adminService.inviteUser(email, role);
    }

    @Get('config')
    async getConfig() {
        return this.adminService.getConfig();
    }

    @Patch('config')
    async updateConfig(@Body() data: any) {
        return this.adminService.updateConfig(data);
    }
}
