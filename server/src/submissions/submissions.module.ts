import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ConfigModule, AiModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService]
})
export class SubmissionsModule { }
