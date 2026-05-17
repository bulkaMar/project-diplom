import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma.service';

// ─── Mock ──────────────────────────────────────────────────────────────────────

const mockPrisma = {
  review: {
    upsert: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  // ── Тест 11 ─────────────────────────────────────────────────────────────────
  it('11. create — створює новий відгук (upsert) з рейтингом та коментарем', async () => {
    const mockReview = {
      id: 'r1',
      userId: 'u1',
      courseId: 'c1',
      rating: 5,
      comment: 'Чудовий курс!',
      createdAt: new Date(),
    };
    mockPrisma.review.upsert.mockResolvedValue(mockReview);

    const result = await service.create('u1', 'c1', 5, 'Чудовий курс!');

    expect(result).toEqual(mockReview);
    expect(mockPrisma.review.upsert).toHaveBeenCalledWith({
      where: { userId_courseId: { userId: 'u1', courseId: 'c1' } },
      create: { userId: 'u1', courseId: 'c1', rating: 5, comment: 'Чудовий курс!' },
      update: { rating: 5, comment: 'Чудовий курс!' },
    });
  });

  // ── Тест 12 ─────────────────────────────────────────────────────────────────
  it('12. create — оновлює існуючий відгук через upsert (повторна оцінка)', async () => {
    const updatedReview = { id: 'r1', userId: 'u1', courseId: 'c1', rating: 4, comment: 'Непогано' };
    mockPrisma.review.upsert.mockResolvedValue(updatedReview);

    const result = await service.create('u1', 'c1', 4, 'Непогано');

    expect(result.rating).toBe(4);
    expect(result.comment).toBe('Непогано');
    // upsert має бути викликаний рівно один раз
    expect(mockPrisma.review.upsert).toHaveBeenCalledTimes(1);
  });

  // ── Тест 13 ─────────────────────────────────────────────────────────────────
  it('13. create — працює без comment (необов\'язкове поле)', async () => {
    mockPrisma.review.upsert.mockResolvedValue({
      id: 'r2',
      userId: 'u2',
      courseId: 'c2',
      rating: 3,
      comment: undefined,
    });

    const result = await service.create('u2', 'c2', 3);

    expect(result.rating).toBe(3);
    expect(mockPrisma.review.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ comment: undefined }),
      }),
    );
  });

  // ── Тест 14 ─────────────────────────────────────────────────────────────────
  it('14. findByCourse — повертає всі відгуки курсу у порядку від новіших', async () => {
    const reviews = [
      { id: 'r3', rating: 5, user: { name: 'Марина', email: 'marina@test.com' }, createdAt: new Date('2025-03-01') },
      { id: 'r4', rating: 3, user: { name: 'Іван', email: 'ivan@test.com' },   createdAt: new Date('2025-01-15') },
    ];
    mockPrisma.review.findMany.mockResolvedValue(reviews);

    const result = await service.findByCourse('c1');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('r3');
    expect(mockPrisma.review.findMany).toHaveBeenCalledWith({
      where: { courseId: 'c1' },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  });

  // ── Тест 15 ─────────────────────────────────────────────────────────────────
  it('15. findByCourse — повертає порожній масив якщо відгуків немає', async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);

    const result = await service.findByCourse('c-empty');

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  // ── Тест 16 ─────────────────────────────────────────────────────────────────
  it('16. findByUser — повертає відгук конкретного користувача для курсу', async () => {
    const review = { id: 'r5', userId: 'u3', courseId: 'c3', rating: 4 };
    mockPrisma.review.findUnique.mockResolvedValue(review);

    const result = await service.findByUser('u3', 'c3');

    expect(result).toEqual(review);
    expect(mockPrisma.review.findUnique).toHaveBeenCalledWith({
      where: { userId_courseId: { userId: 'u3', courseId: 'c3' } },
    });
  });

  // ── Тест 17 ─────────────────────────────────────────────────────────────────
  it('17. findByUser — повертає null якщо відгук ще не залишено', async () => {
    mockPrisma.review.findUnique.mockResolvedValue(null);

    const result = await service.findByUser('u-new', 'c1');

    expect(result).toBeNull();
  });
});
