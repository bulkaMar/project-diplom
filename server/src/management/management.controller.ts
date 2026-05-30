import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ManagementService } from './management.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('management')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.TEACHER)
export class ManagementController {
    constructor(private managementService: ManagementService) { }

    @Get('courses')
    async getAllCourses() {
        return this.managementService.getAllCourses();
    }

    @Get('courses/:id')
    async findOne(@Param('id') id: string) {
        return this.managementService.getCourseById(id);
    }

    @Post('courses')
    async createCourse(@Body() data: { title: string; slug: string; description?: string }) {
        return this.managementService.createCourse(data);
    }

    @Put('courses/:id')
    async updateCourse(@Param('id') id: string, @Body() data: any) {
        return this.managementService.updateCourse(id, data);
    }

    @Delete('courses/:id')
    async deleteCourse(@Param('id') id: string) {
        return this.managementService.deleteCourse(id);
    }

    @Post('courses/:courseId/modules')
    async createModule(
        @Param('courseId') courseId: string,
        @Body() data: { title: string; orderIndex: number; description?: string }
    ) {
        return this.managementService.createModule(courseId, data);
    }

    @Patch('modules/:id')
    async updateModule(@Param('id') id: string, @Body() data: any) {
        return this.managementService.updateModule(id, data);
    }

    @Delete('modules/:id')
    async deleteModule(@Param('id') id: string) {
        return this.managementService.deleteModule(id);
    }

    @Post('modules/:moduleId/lessons')
    async createLesson(
        @Param('moduleId') moduleId: string,
        @Body() data: any
    ) {
        return this.managementService.createLesson(moduleId, data);
    }

    @Patch('lessons/:id')
    async updateLesson(@Param('id') id: string, @Body() data: any) {
        return this.managementService.updateLesson(id, data);
    }

    @Get('groups')
    async getAllGroups() {
        return this.managementService.getAllGroups();
    }

    @Post('groups')
    async createGroup(@Body('name') name: string) {
        return this.managementService.createGroup(name);
    }

    @Post('groups/:id/users/:userId')
    async addUserToGroup(@Param('id') id: string, @Param('userId') userId: string) {
        return this.managementService.addUserToGroup(id, userId);
    }

    @Post('groups/:id/courses/:courseId')
    async linkCourseToGroup(@Param('id') id: string, @Param('courseId') courseId: string) {
        return this.managementService.linkCourseToGroup(id, courseId);
    }
}
