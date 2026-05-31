import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role, LessonType, Difficulty } from '@prisma/client';

@Injectable()
export class ManagementService {
    constructor(private prisma: PrismaService) { }

    // --- Courses ---
    async getCourseById(id: string) {
        return this.prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    include: {
                        lessons: {
                            orderBy: { orderIndex: 'asc' }
                        }
                    },
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });
    }

    async createCourse(data: { title: string; slug: string; description?: string }) {
        return this.prisma.course.create({
            data: {
                ...data,
                published: false,
            },
        });
    }

    async updateCourse(id: string, data: any) {
        return this.prisma.course.update({
            where: { id },
            data,
        });
    }

    async deleteCourse(id: string) {
        return this.prisma.course.delete({
            where: { id },
        });
    }

    async getAllCourses() {
        return this.prisma.course.findMany({
            include: {
                _count: {
                    select: { modules: true }
                }
            }
        });
    }

    // --- Modules ---
    async createModule(courseId: string, data: { title: string; orderIndex: number; description?: string }) {
        return this.prisma.module.create({
            data: {
                ...data,
                courseId,
            },
        });
    }

    async updateModule(id: string, data: any) {
        return this.prisma.module.update({
            where: { id },
            data,
        });
    }

    async deleteModule(id: string) {
        // Lessons cascade-delete via Prisma schema (onDelete: Cascade)
        return this.prisma.module.delete({
            where: { id },
        });
    }


    // --- Lessons ---
    async createLesson(moduleId: string, data: { 
        title: string; 
        slug: string; 
        orderIndex: number; 
        content: string; 
        type: LessonType;
        difficulty?: Difficulty;
        initialCode?: string;
        testCases?: any;
    }) {
        return this.prisma.lesson.create({
            data: {
                ...data,
                moduleId,
            },
        });
    }

    async updateLesson(id: string, data: any) {
        return this.prisma.lesson.update({
            where: { id },
            data,
        });
    }

    // --- Groups ---
    async getStudents() {
        return this.prisma.user.findMany({
            where: { role: Role.APPLICANT },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getAllGroups() {
        return this.prisma.group.findMany({
            include: {
                _count: {
                    select: { users: true, courses: true }
                }
            }
        });
    }

    async createGroup(name: string) {
        return this.prisma.group.create({
            data: { name },
        });
    }

    async addUserToGroup(groupId: string, userId: string) {
        return this.prisma.group.update({
            where: { id: groupId },
            data: {
                users: {
                    connect: { id: userId }
                }
            }
        });
    }

    async linkCourseToGroup(groupId: string, courseId: string) {
        return this.prisma.group.update({
            where: { id: groupId },
            data: {
                courses: {
                    connect: { id: courseId }
                }
            }
        });
    }
}
