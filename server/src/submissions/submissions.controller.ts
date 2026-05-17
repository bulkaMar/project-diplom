import { Controller, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('submissions')
@UseGuards(AuthGuard('jwt'))
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    /** Run against provided cases — for editor preview/generation */
    @Post('run-custom')
    async runCustom(
        @Body('code') code: string,
        @Body('testCases') testCases: any[],
    ) {
        return this.submissionsService.runAgainstCases(code, testCases);
    }

    /** Submit — runs tests + optional Gemini hint on failure */
    @Post(':lessonId')
    async submit(
        @Param('lessonId') lessonId: string,
        @Body('code') code: string,
        @Request() req,
    ) {
        return this.submissionsService.submit(lessonId, req.user.id, code);
    }

    /** Run — execute all test cases, show output per case. No AI, no DB write. */
    @Post(':lessonId/run')
    async run(
        @Param('lessonId') lessonId: string,
        @Body('code') code: string,
    ) {
        return this.submissionsService.run(lessonId, code);
    }
}
