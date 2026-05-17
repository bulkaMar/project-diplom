import { Controller, Get, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Request() req) {
        return this.coursesService.findAll(req.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':slug')
    async findOne(@Param('slug') slug: string, @Request() req) {
        const course = await this.coursesService.findOne(slug, req.user.id);
        if (!course) {
            throw new NotFoundException('Course not found');
        }
        return course;
    }
}
