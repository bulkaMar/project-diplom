import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReviewsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: string, courseId: string, rating: number, comment?: string) {
        return this.prisma.review.upsert({
            where: { userId_courseId: { userId, courseId } },
            create: { userId, courseId, rating, comment },
            update: { rating, comment },
        });
    }

    async findByCourse(courseId: string) {
        return this.prisma.review.findMany({
            where: { courseId },
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByUser(userId: string, courseId: string) {
        return this.prisma.review.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
    }
}
