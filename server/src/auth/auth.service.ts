import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private mailService: MailService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && user.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { email: user.email, sub: user.id, role: user.role, name: user.name };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(registerDto: RegisterDto) {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // If group name provided — try to find it in DB, skip silently if not found
        let groupConnect: { connect: { name: string } } | undefined;
        if (registerDto.groupName) {
            const group = await this.prisma.group.findUnique({
                where: { name: registerDto.groupName.toUpperCase() },
            });
            if (group) {
                groupConnect = { connect: { name: group.name } };
            }
            // If group not found — just register without a group, no error
        }

        try {
            const user = await this.prisma.user.create({
                data: {
                    email: registerDto.email,
                    passwordHash: hashedPassword,
                    name: registerDto.name,
                    ...(groupConnect ? { groups: groupConnect } : {}),
                },
            });
            const { passwordHash, ...result } = user;
            return result;
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new ConflictException('Email already exists');
            }
            throw new InternalServerErrorException('Registration failed');
        }
    }

    async validateGoogleUser(googleUser: any) {
        let user = await this.prisma.user.findUnique({
            where: { googleId: googleUser.googleId },
        });

        if (!user) {
            // Check by email if user exists but hasn't linked Google
            user = await this.prisma.user.findUnique({
                where: { email: googleUser.email },
            });

            if (user) {
                // Link Google to existing account
                user = await this.prisma.user.update({
                    where: { email: googleUser.email },
                    data: { googleId: googleUser.googleId },
                });
            } else {
                // Create new user
                user = await this.prisma.user.create({
                    data: {
                        email: googleUser.email,
                        name: googleUser.name,
                        googleId: googleUser.googleId,
                        role: 'APPLICANT',
                    },
                });
            }
        }

        const payload = { email: user.email, sub: user.id, role: user.role, name: user.name };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async forgotPassword(email: string): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        // Always return success to prevent email enumeration attacks
        if (!user) return;

        // Delete any existing tokens for this user
        await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

        // Generate a secure random token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await this.prisma.passwordResetToken.create({
            data: { token, userId: user.id, expiresAt },
        });

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

        await this.mailService.sendPasswordReset(email, user.name || email, resetUrl);
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const resetToken = await this.prisma.passwordResetToken.findUnique({ where: { token } });

        if (!resetToken) {
            throw new BadRequestException('Недійсний або прострочений токен');
        }

        if (resetToken.expiresAt < new Date()) {
            await this.prisma.passwordResetToken.delete({ where: { token } });
            throw new BadRequestException('Посилання для скидання пароля прострочено');
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await this.prisma.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash },
        });

        // Delete the token so it can't be reused
        await this.prisma.passwordResetToken.delete({ where: { token } });
    }

    async updateProfile(userId: string, updateDto: UpdateProfileDto) {
        console.log(`Updating profile for user ${userId}:`, updateDto);
        try {
            const user = await this.prisma.user.update({
                where: { id: userId },
                data: updateDto,
            });
            const { passwordHash, ...result } = user;
            return result;
        } catch (error: any) {
            console.error('Update profile error:', error);
            if (error.code === 'P2002') {
                throw new ConflictException('Email already exists');
            }
            throw new InternalServerErrorException('Помилка при оновленні профілю');
        }
    }

    async getStats(userId: string) {
        const [enrolledCourses, completedLessons, completedPractices, scoreAgg] = await Promise.all([
            this.prisma.course.count({
                where: { groups: { some: { users: { some: { id: userId } } } } }
            }),
            this.prisma.progress.count({
                where: { userId, completed: true }
            }),
            this.prisma.progress.count({
                where: { userId, completed: true, lesson: { type: 'PRACTICE' } }
            }),
            this.prisma.progress.aggregate({
                _avg: { score: true },
                where: { userId, completed: true, score: { not: null } }
            })
        ]);

        return {
            courses: enrolledCourses,
            lessons: completedLessons,
            practices: completedPractices,
            avgScore: Math.round(scoreAgg._avg.score || 0)
        };
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) return null;
        const { passwordHash, ...result } = user;
        return result;
    }

    async getTeacherStats() {
        // All courses with number of enrolled students (via groups)
        const courses = await this.prisma.course.findMany({
            select: {
                id: true,
                title: true,
                published: true,
                _count: {
                    select: { modules: true },
                },
                groups: {
                    select: {
                        _count: {
                            select: { users: true },
                        },
                    },
                },
            },
        });

        const coursesWithStudents = courses.map(course => ({
            id: course.id,
            title: course.title,
            published: course.published,
            modulesCount: course._count.modules,
            studentsCount: course.groups.reduce((sum, g) => sum + g._count.users, 0),
        }));

        return {
            totalCourses: courses.length,
            publishedCourses: courses.filter(c => c.published).length,
            totalStudents: coursesWithStudents.reduce((sum, c) => sum + c.studentsCount, 0),
            courses: coursesWithStudents,
        };
    }
}
