import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from './lessons.service';
import { PrismaService } from '../prisma.service';

// ─── Mock ──────────────────────────────────────────────────────────────────────

const mockPrisma = {
  lesson: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  progress: {
    upsert: jest.fn(),
  },
};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('LessonsService', () => {
  let service: LessonsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
  });

  // ── Тест 18 ─────────────────────────────────────────────────────────────────
  it('18. updateProgress — зберігає прогрес через upsert з completed=true та score', async () => {
    const mockProgress = { id: 'p1', userId: 'u1', lessonId: 'l1', completed: true, score: 90 };
    mockPrisma.progress.upsert.mockResolvedValue(mockProgress);

    const result = await service.updateProgress('l1', 'u1', true, 90);

    expect(result).toEqual(mockProgress);
    expect(mockPrisma.progress.upsert).toHaveBeenCalledWith({
      where: { userId_lessonId: { userId: 'u1', lessonId: 'l1' } },
      create: { userId: 'u1', lessonId: 'l1', completed: true, score: 90 },
      update: { completed: true, score: 90 },
    });
  });

  // ── Тест 19 ─────────────────────────────────────────────────────────────────
  it('19. updateProgress — зберігає прогрес без score (необов\'язкове поле)', async () => {
    const mockProgress = { id: 'p2', userId: 'u2', lessonId: 'l2', completed: false, score: undefined };
    mockPrisma.progress.upsert.mockResolvedValue(mockProgress);

    const result = await service.updateProgress('l2', 'u2', false);

    expect(result.completed).toBe(false);
    expect(mockPrisma.progress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ score: undefined }),
      }),
    );
  });

  // ── Тест 20 ─────────────────────────────────────────────────────────────────
  it('20. getDifficultyStatus — STANDARD розблоковується лише після проходження BASIC', async () => {
    mockPrisma.lesson.findMany.mockResolvedValue([
      { id: 'l-b1', difficulty: 'BASIC',    orderIndex: 1, progress: [{ completed: true }] },
      { id: 'l-s1', difficulty: 'STANDARD', orderIndex: 2, progress: [] },
      { id: 'l-a1', difficulty: 'ADVANCED', orderIndex: 3, progress: [] },
    ]);

    const result = await service.getDifficultyStatus('m1', 'u1');

    expect(result.BASIC.unlocked).toBe(true);
    expect(result.BASIC.completed).toBe(true);
    expect(result.STANDARD.unlocked).toBe(true);   // BASIC завершено
    expect(result.ADVANCED.unlocked).toBe(false);  // STANDARD ще не завершено
  });

  // ── Тест 21 ─────────────────────────────────────────────────────────────────
  it('21. getDifficultyStatus — ADVANCED розблоковується тільки після BASIC і STANDARD', async () => {
    mockPrisma.lesson.findMany.mockResolvedValue([
      { id: 'l-b1', difficulty: 'BASIC',    orderIndex: 1, progress: [{ completed: true }] },
      { id: 'l-s1', difficulty: 'STANDARD', orderIndex: 2, progress: [{ completed: true }] },
      { id: 'l-a1', difficulty: 'ADVANCED', orderIndex: 3, progress: [] },
    ]);

    const result = await service.getDifficultyStatus('m1', 'u1');

    expect(result.ADVANCED.unlocked).toBe(true);
    expect(result.ADVANCED.completed).toBe(false);
    expect(result.ADVANCED.lessons[0].isCompleted).toBe(false);
  });

  // ── Тест 22 ─────────────────────────────────────────────────────────────────
  it('22. getDifficultyStatus — completed=false для рівня без уроків', async () => {
    // Немає уроків BASIC — completed має бути false
    mockPrisma.lesson.findMany.mockResolvedValue([
      { id: 'l-s1', difficulty: 'STANDARD', orderIndex: 1, progress: [{ completed: true }] },
    ]);

    const result = await service.getDifficultyStatus('m2', 'u1');

    expect(result.BASIC.lessons).toHaveLength(0);
    expect(result.BASIC.completed).toBe(false); // isLevelCompleted([]) === false
    expect(result.STANDARD.unlocked).toBe(false); // базовий не пройдено
  });
});
