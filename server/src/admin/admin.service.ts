import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';
import { MailService } from '../auth/mail.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private configService: ConfigService
    ) { }

    async inviteUser(email: string, role: Role) {
        // 1. Check if user already exists
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Користувач з таким email вже існує');
        }

        // 2. Create user (without password)
        const user = await this.prisma.user.create({
            data: {
                email,
                role,
            }
        });

        // 3. Generate setup token (using PasswordResetToken model)
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await this.prisma.passwordResetToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt,
            }
        });

        // 4. Send Email
        const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const setupUrl = `${baseUrl}/reset-password?token=${token}`;
        
        await this.mailService.sendInvitation(email, email, setupUrl);

        return { success: true, userId: user.id };
    }

    async getAllUsers() {
        return this.prisma.user.findMany({
            include: {
                progress: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getAllCourses() {
        return this.prisma.course.findMany({
            include: {
                _count: {
                    select: { modules: true }
                },
                modules: {
                    include: {
                        _count: { select: { lessons: true } }
                    }
                }
            }
        });
    }

    async getAllReviews() {
        return this.prisma.review.findMany({
            include: {
                user: {
                    select: { id: true, email: true, name: true },
                },
                course: {
                    select: { id: true, title: true, slug: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ─────────── ТИМЧАСОВО: псевдо-відгуки ───────────
    // Усі псевдо-студенти створюються на цьому домені, щоб їх легко було
    // знайти та видалити одним запитом. Прибрати разом із формою.
    private readonly MOCK_EMAIL_DOMAIN = 'mock.cpplearn';

    /** Створює відгук від імені нового псевдо-студента. */
    async createMockReview(name: string, courseId: string, rating: number, comment?: string) {
        if (!name?.trim()) throw new BadRequestException('Вкажіть імʼя студента');
        if (!courseId) throw new BadRequestException('Оберіть курс');
        const r = Number(rating);
        if (!Number.isInteger(r) || r < 1 || r > 5) {
            throw new BadRequestException('Оцінка має бути цілим числом від 1 до 5');
        }

        const email = `mock-${crypto.randomBytes(5).toString('hex')}@${this.MOCK_EMAIL_DOMAIN}`;
        const user = await this.prisma.user.create({
            data: { email, name: name.trim(), role: Role.STUDENT },
        });

        return this.prisma.review.create({
            data: { userId: user.id, courseId, rating: r, comment: comment?.trim() || null },
            include: {
                user: { select: { id: true, name: true, email: true } },
                course: { select: { id: true, title: true, slug: true } },
            },
        });
    }

    /** Видаляє всіх псевдо-студентів; їхні відгуки приберуться каскадно. */
    async deleteMockReviews() {
        const result = await this.prisma.user.deleteMany({
            where: { email: { endsWith: `@${this.MOCK_EMAIL_DOMAIN}` } },
        });
        return { deletedUsers: result.count };
    }

    async updateUserRole(userId: string, role: Role) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
        });
    }

    async getStats() {
        const usersCount = await this.prisma.user.count();
        const coursesCount = await this.prisma.course.count();
        const reviewsCount = await this.prisma.review.count();
        const submissionsCount = await this.prisma.submission.count();
        const avgRating = await this.prisma.review.aggregate({
            _avg: { rating: true },
        });

        return {
            usersCount,
            coursesCount,
            reviewsCount,
            submissionsCount,
            averageRating: avgRating._avg.rating || 0,
        };
    }

    async getConfig() {
        let config = await this.prisma.systemConfig.findUnique({
            where: { id: 'global' },
        });

        if (!config) {
            config = await this.prisma.systemConfig.create({
                data: { id: 'global' },
            });
        }

        return config;
    }

    async updateConfig(data: { geminiApiKey?: string, adviceSystemActive?: boolean }) {
        return this.prisma.systemConfig.upsert({
            where: { id: 'global' },
            update: data,
            create: { id: 'global', ...data },
        });
    }
}
