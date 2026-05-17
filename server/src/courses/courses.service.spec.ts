import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma.service';

// ─── Mock ──────────────────────────────────────────────────────────────────────

const mockPrisma = {
  course: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  // ── Тест 23 ─────────────────────────────────────────────────────────────────
  it('23. findAll — повертає список курсів з кількістю модулів', async () => {
    const mockCourses = [
      { id: 'c1', title: 'C++ Основи',     slug: 'cpp-basics',    _count: { modules: 5 } },
      { id: 'c2', title: 'C++ Алгоритми',  slug: 'cpp-algo',      _count: { modules: 11 } },
    ];
    mockPrisma.course.findMany.mockResolvedValue(mockCourses);

    const result = await service.findAll();

    expect(result).toHaveLength(2);
    expect(result[0]._count.modules).toBe(5);
    expect(result[1]._count.modules).toBe(11);
    expect(mockPrisma.course.findMany).toHaveBeenCalledTimes(1);
  });

  // ── Тест 24 ─────────────────────────────────────────────────────────────────
  it('24. findOne — повертає null якщо курс не знайдено', async () => {
    mockPrisma.course.findUnique.mockResolvedValue(null);

    const result = await service.findOne('nonexistent-slug', 'u1');

    expect(result).toBeNull();
  });

  // ── Тест 25 ─────────────────────────────────────────────────────────────────
  it('25. findOne — правильно розраховує progressPercent коли всі уроки пройдено', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({
      id: 'c1',
      title: 'C++ Основи',
      slug: 'cpp-basics',
      _count: { modules: 1 },
      modules: [
        {
          id: 'm1',
          lessons: [
            { id: 'l1', progress: [{ completed: true }] },
            { id: 'l2', progress: [{ completed: true }] },
          ],
        },
      ],
    });

    const result = await service.findOne('cpp-basics', 'u1');

    expect(result).not.toBeNull();
    expect(result!.progressPercent).toBe(100);
    expect(result!.totalLessons).toBe(2);
    expect(result!.completedLessons).toBe(2);
  });

  // ── Тест 26 ─────────────────────────────────────────────────────────────────
  it('26. findOne — progressPercent = 0 якщо жоден урок не завершено', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({
      id: 'c1',
      title: 'C++ Основи',
      slug: 'cpp-basics',
      _count: { modules: 1 },
      modules: [
        {
          id: 'm1',
          lessons: [
            { id: 'l1', progress: [] },
            { id: 'l2', progress: [{ completed: false }] },
          ],
        },
      ],
    });

    const result = await service.findOne('cpp-basics', 'u1');

    expect(result!.progressPercent).toBe(0);
    expect(result!.completedLessons).toBe(0);
    expect(result!.totalLessons).toBe(2);
  });

  // ── Тест 27 ─────────────────────────────────────────────────────────────────
  it('27. findOne — progressPercent = 50 якщо половина уроків пройдена', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({
      id: 'c2',
      title: 'C++ Алгоритми',
      slug: 'cpp-algo',
      _count: { modules: 1 },
      modules: [
        {
          id: 'm1',
          lessons: [
            { id: 'l1', progress: [{ completed: true }] },
            { id: 'l2', progress: [{ completed: false }] },
            { id: 'l3', progress: [] },
            { id: 'l4', progress: [{ completed: true }] },
          ],
        },
      ],
    });

    const result = await service.findOne('cpp-algo', 'u1');

    expect(result!.progressPercent).toBe(50);
    expect(result!.completedLessons).toBe(2);
    expect(result!.totalLessons).toBe(4);
  });

  // ── Тест 28 ─────────────────────────────────────────────────────────────────
  it('28. findOne — progressPercent = 0 для курсу без уроків (уникнення ділення на 0)', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({
      id: 'c3',
      title: 'Порожній курс',
      slug: 'empty-course',
      _count: { modules: 0 },
      modules: [],
    });

    const result = await service.findOne('empty-course', 'u1');

    expect(result!.progressPercent).toBe(0);
    expect(result!.totalLessons).toBe(0);
    expect(result!.completedLessons).toBe(0);
  });
});
