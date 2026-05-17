import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CoursesService {
    constructor(private prisma: PrismaService) { }

    async findAll(user: any) {
        // Admins and Teachers see all courses
        if (user.role === 'ADMIN' || user.role === 'TEACHER') {
            return this.prisma.course.findMany({
                include: {
                    _count: {
                        select: { modules: true }
                    }
                }
            });
        }

        // Students and Applicants see only published courses assigned to their group
        return this.prisma.course.findMany({
            where: {
                published: true,
                groups: {
                    some: {
                        users: {
                            some: {
                                id: user.id
                            }
                        }
                    }
                }
            },
            include: {
                _count: {
                    select: { modules: true }
                }
            }
        });
    }

    async findOne(slug: string, userId: string) {
        const course = await this.prisma.course.findUnique({
            where: { slug },
            include: {
                modules: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { orderIndex: 'asc' },
                            include: {
                                progress: {
                                    where: { userId }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: { modules: true }
                }
            }
        });

        if (!course) return null;

        // Calculate progress
        let totalLessons = 0;
        let completedLessons = 0;

        course.modules.forEach(module => {
            totalLessons += module.lessons.length;
            module.lessons.forEach(lesson => {
                if (lesson.progress.length > 0 && lesson.progress[0].completed) {
                    completedLessons++;
                }
            });
        });

        const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        return {
            ...course,
            progressPercent,
            totalLessons,
            completedLessons
        };
    }
}
