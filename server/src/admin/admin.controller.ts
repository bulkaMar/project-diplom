import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
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

    // ─────────── ТИМЧАСОВО: псевдо-відгуки (прибрати разом із формою) ───────────
    @Post('reviews/mock')
    async createMockReview(
        @Body() body: { name: string; courseId: string; rating: number; comment?: string },
    ) {
        return this.adminService.createMockReview(body.name, body.courseId, body.rating, body.comment);
    }

    @Delete('reviews/mock')
    async deleteMockReviews() {
        return this.adminService.deleteMockReviews();
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
