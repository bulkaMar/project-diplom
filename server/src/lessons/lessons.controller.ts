import { Controller, Get, Param, Post, Body, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('lessons')
@UseGuards(AuthGuard('jwt'))
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) { }

    @Get('module/:moduleId/difficulty-status')
    async getDifficultyStatus(@Param('moduleId') moduleId: string, @Request() req) {
        return this.lessonsService.getDifficultyStatus(moduleId, req.user.id);
    }

    @Get(':slug')
    async findOne(@Param('slug') slug: string, @Request() req) {
        const lesson = await this.lessonsService.findOne(slug, req.user.id);
        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }
        return lesson;
    }

    @Post(':id/complete')
    async complete(
        @Param('id') id: string,
        @Body('score') score: number,
        @Body('completed') completed: boolean,
        @Request() req
    ) {
        // Якщо completed не передано (наприклад, зі старих викликів), вважаємо true
        const isCompleted = completed !== undefined ? completed : true;
        return this.lessonsService.updateProgress(id, req.user.id, isCompleted, score);
    }
}

