import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LessonsService {
    constructor(private prisma: PrismaService) { }

    async findOne(slug: string, userId: string) {
        return this.prisma.lesson.findUnique({
            where: { slug },
            include: {
                progress: {
                    where: { userId }
                },
                module: {
                    include: {
                        course: {
                            select: { slug: true, title: true }
                        }
                    }
                }
            }
        });
    }

    async updateProgress(lessonId: string, userId: string, completed: boolean, score?: number) {
        return this.prisma.progress.upsert({
            where: {
                userId_lessonId: { userId, lessonId }
            },
            create: {
                userId,
                lessonId,
                completed,
                score
            },
            update: {
                completed,
                score
            }
        });
    }

    async getDifficultyStatus(moduleId: string, userId: string) {
        const rawLessons = await this.prisma.lesson.findMany({
            where: { moduleId },
            include: {
                progress: { where: { userId } }
            },
            orderBy: { orderIndex: 'asc' }
        });

        // Cast to any to access the difficulty field (new after migration)
        const lessons = rawLessons as any[];

        const byDifficulty = {
            BASIC: lessons.filter(l => l.difficulty === 'BASIC'),
            STANDARD: lessons.filter(l => l.difficulty === 'STANDARD'),
            ADVANCED: lessons.filter(l => l.difficulty === 'ADVANCED'),
        };

        const isLevelCompleted = (lessonList: any[]) => {
            if (lessonList.length === 0) return false;
            return lessonList.every(l => l.progress[0]?.completed === true);
        };
        
        const basicCompleted = isLevelCompleted(byDifficulty.BASIC);
        const standardCompleted = isLevelCompleted(byDifficulty.STANDARD);

        return {
            BASIC: {
                unlocked: true,
                completed: basicCompleted,
                lessons: byDifficulty.BASIC.map(l => ({
                    ...l,
                    isCompleted: l.progress[0]?.completed ?? false,
                    score: l.progress[0]?.score ?? null
                }))
            },
            STANDARD: {
                unlocked: basicCompleted,
                completed: standardCompleted,
                lessons: byDifficulty.STANDARD.map(l => ({
                    ...l,
                    isCompleted: l.progress[0]?.completed ?? false,
                    score: l.progress[0]?.score ?? null
                }))
            },
            ADVANCED: {
                unlocked: basicCompleted && standardCompleted,
                completed: isLevelCompleted(byDifficulty.ADVANCED),
                lessons: byDifficulty.ADVANCED.map(l => ({
                    ...l,
                    isCompleted: l.progress[0]?.completed ?? false,
                    score: l.progress[0]?.score ?? null
                }))
            }
        };
    }
}
