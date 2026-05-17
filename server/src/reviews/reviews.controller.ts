import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    /** POST /reviews/:courseId — create or update own review */
    @UseGuards(AuthGuard('jwt'))
    @Post(':courseId')
    async create(
        @Param('courseId') courseId: string,
        @Body('rating') rating: number,
        @Body('comment') comment: string,
        @Request() req: any,
    ) {
        return this.reviewsService.create(req.user.id, courseId, rating, comment);
    }

    /** GET /reviews/:courseId — list all reviews for a course */
    @Get(':courseId')
    async findByCourse(@Param('courseId') courseId: string) {
        return this.reviewsService.findByCourse(courseId);
    }

    /** GET /reviews/:courseId/mine — check if current user has already reviewed */
    @UseGuards(AuthGuard('jwt'))
    @Get(':courseId/mine')
    async findMine(@Param('courseId') courseId: string, @Request() req: any) {
        return this.reviewsService.findByUser(req.user.id, courseId);
    }
}
