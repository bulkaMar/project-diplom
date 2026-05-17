import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  passwordResetToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('http://localhost:3000'),
};

const mockMailService = {
  sendPasswordReset: jest.fn().mockResolvedValue(undefined),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── Тест 1 ──────────────────────────────────────────────────────────────────
  it('1. validateUser — повертає користувача без passwordHash при правильних даних', async () => {
    const passwordHash = await bcrypt.hash('secret', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'test@test.com',
      name: 'Тест',
      role: 'STUDENT',
      passwordHash,
    });

    const result = await service.validateUser('test@test.com', 'secret');

    expect(result).toBeDefined();
    expect(result.email).toBe('test@test.com');
    expect(result).not.toHaveProperty('passwordHash');
  });

  // ── Тест 2 ──────────────────────────────────────────────────────────────────
  it('2. validateUser — повертає null при неправильному паролі', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'test@test.com',
      passwordHash,
    });

    const result = await service.validateUser('test@test.com', 'wrong-password');
    expect(result).toBeNull();
  });

  // ── Тест 3 ──────────────────────────────────────────────────────────────────
  it('3. validateUser — повертає null якщо користувача не знайдено', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await service.validateUser('nobody@test.com', 'pass');
    expect(result).toBeNull();
  });

  // ── Тест 4 ──────────────────────────────────────────────────────────────────
  it('4. login — повертає access_token при правильних даних', async () => {
    const passwordHash = await bcrypt.hash('pass123', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@test.com',
      name: 'User',
      role: 'STUDENT',
      passwordHash,
    });

    const result = await service.login({ email: 'user@test.com', password: 'pass123' });

    expect(result).toHaveProperty('access_token');
    expect(result.access_token).toBe('mock-jwt-token');
    expect(mockJwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@test.com' }),
    );
  });

  // ── Тест 5 ──────────────────────────────────────────────────────────────────
  it('5. login — кидає UnauthorizedException при хибних даних', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'bad@test.com', password: 'bad' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // ── Тест 6 ──────────────────────────────────────────────────────────────────
  it('6. register — успішно створює нового користувача', async () => {
    mockPrisma.user.create.mockResolvedValue({
      id: 'u2',
      email: 'new@test.com',
      name: 'Новий',
      role: 'STUDENT',
      passwordHash: 'hashed',
    });

    const result = await service.register({
      email: 'new@test.com',
      password: 'strongPass1!',
      name: 'Новий',
    });

    expect(result.email).toBe('new@test.com');
    expect(result).not.toHaveProperty('passwordHash');
    expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
  });

  // ── Тест 7 ──────────────────────────────────────────────────────────────────
  it('7. register — кидає ConflictException якщо email вже існує (P2002)', async () => {
    const prismaError = { code: 'P2002' };
    mockPrisma.user.create.mockRejectedValue(prismaError);

    await expect(
      service.register({ email: 'dup@test.com', password: '123456', name: 'Дубль' }),
    ).rejects.toThrow(ConflictException);
  });

  // ── Тест 8 ──────────────────────────────────────────────────────────────────
  it('8. forgotPassword — не кидає помилку якщо користувача не знайдено (захист від перебору)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(service.forgotPassword('ghost@test.com')).resolves.toBeUndefined();
    expect(mockMailService.sendPasswordReset).not.toHaveBeenCalled();
  });

  // ── Тест 9 ──────────────────────────────────────────────────────────────────
  it('9. forgotPassword — надсилає лист та зберігає токен для існуючого користувача', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u3',
      email: 'real@test.com',
      name: 'Real User',
    });
    mockPrisma.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.passwordResetToken.create.mockResolvedValue({});

    await service.forgotPassword('real@test.com');

    expect(mockPrisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'u3' },
    });
    expect(mockPrisma.passwordResetToken.create).toHaveBeenCalledTimes(1);
    expect(mockMailService.sendPasswordReset).toHaveBeenCalledWith(
      'real@test.com',
      'Real User',
      expect.stringContaining('/reset-password?token='),
    );
  });

  // ── Тест 10 ─────────────────────────────────────────────────────────────────
  it('10. resetPassword — кидає BadRequestException якщо токен прострочений', async () => {
    const expiredDate = new Date(Date.now() - 1000 * 60 * 60 * 2); // 2 години тому
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      token: 'expired-token',
      userId: 'u1',
      expiresAt: expiredDate,
    });
    mockPrisma.passwordResetToken.delete.mockResolvedValue({});

    await expect(
      service.resetPassword('expired-token', 'newPass123'),
    ).rejects.toThrow(BadRequestException);

    // Прострочений токен має бути видалений з БД
    expect(mockPrisma.passwordResetToken.delete).toHaveBeenCalledWith({
      where: { token: 'expired-token' },
    });
  });
});
