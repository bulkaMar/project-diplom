/**
 * seed-reviews.ts — наповнює базу мок-відгуками (таблиця Review).
 *
 * Запуск ЛОКАЛЬНО (бере DATABASE_URL із server/.env):
 *   npx ts-node seed-reviews.ts
 *
 * Запуск проти ПРОДУ (Railway): передай прод-URL у змінній оточення.
 * dotenv НЕ перетирає вже задані змінні, тому shell-значення має пріоритет:
 *   DATABASE_URL="postgresql://...railway..." npx ts-node seed-reviews.ts
 *
 * Скрипт ідемпотентний: повторний запуск оновлює, а не дублює (upsert по
 * email для користувача і по (userId, courseId) для відгуку).
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Підвантажуємо локальний .env лише як запасний варіант — якщо DATABASE_URL
// уже заданий у shell (для прода), dotenv його НЕ перезапише.
dotenv.config({ path: '/Users/marinabulah/Desktop/diploma/server/.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─────────── МОК-ВІДГУКИ ───────────
// rating 1-5, comment — українською. Теми збігаються з підсумковою секцією
// (миттєва перевірка, ШІ-ментор, редактор у браузері, прогрес + побажання).
const MOCK_REVIEWS: { name: string; email: string; rating: number; comment: string }[] = [
    {
        name: 'Олена Коваленко',
        email: 'olena.kovalenko@example.com',
        rating: 5,
        comment:
            'Найбільше сподобалась миттєва автоматична перевірка коду — не треба чекати викладача, одразу видно, де помилка.',
    },
    {
        name: 'Дмитро Шевченко',
        email: 'dmytro.shevchenko@example.com',
        rating: 5,
        comment:
            'Підказки ШІ-ментора українською дуже виручають. Підштовхують до думки, але не дають готову відповідь — і це круто.',
    },
    {
        name: 'Софія Бондаренко',
        email: 'sofia.bondarenko@example.com',
        rating: 5,
        comment:
            'Зручно, що редактор коду прямо в браузері — нічого не треба встановлювати, сів і пишеш C++.',
    },
    {
        name: 'Андрій Мельник',
        email: 'andrii.melnyk@example.com',
        rating: 5,
        comment:
            'Покрокова структура курсу і відстеження прогресу мотивують доходити до кінця. Видно, скільки вже пройдено.',
    },
    {
        name: 'Марія Ткаченко',
        email: 'mariia.tkachenko@example.com',
        rating: 4,
        comment:
            'Курс класний, але хотілося б більше прикладів і теорії до складніших тем, особливо вказівники та структури.',
    },
    {
        name: 'Назар Кравченко',
        email: 'nazar.kravchenko@example.com',
        rating: 4,
        comment:
            'Хотілося б ширшу базу практичних завдань різної складності — від простих до олімпіадних.',
    },
    {
        name: 'Вікторія Поліщук',
        email: 'viktoriia.polishchuk@example.com',
        rating: 5,
        comment:
            'Інтерфейс приємний, навчатися легко. Було б супер додати гейміфікацію — бейджі, рейтинги, досягнення.',
    },
    {
        name: 'Іван Гончаренко',
        email: 'ivan.honcharenko@example.com',
        rating: 5,
        comment:
            'Найзручніша платформа для старту в C++ з тих, що пробував. Бракує тільки мобільної версії, щоб вчитися зі смартфона.',
    },
    {
        name: 'Катерина Савчук',
        email: 'kateryna.savchuk@example.com',
        rating: 5,
        comment:
            'Дуже подобається, що відразу бачиш результат тестів. Помилки стали зрозумілішими, навчання пішло швидше.',
    },
    {
        name: 'Олександр Руденко',
        email: 'oleksandr.rudenko@example.com',
        rating: 4,
        comment:
            'Гарний баланс теорії та практики. Чекаю на нові модулі — хочеться більше складних задач.',
    },
];

async function main() {
    // Куди саме пишемо (без пароля) — щоб не залити прод замість локалу помилково.
    const dbHost = (process.env.DATABASE_URL || '').replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1****$2').split('?')[0];
    console.log(`🔌 База: ${dbHost || '(DATABASE_URL не задано!)'}`);
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL не заданий. Передай прод-URL: DATABASE_URL="..." npx ts-node seed-reviews.ts');
    }

    // 1. Беремо курси. Спершу опубліковані; якщо таких немає — усі.
    let courses = await prisma.course.findMany({ where: { published: true }, select: { id: true, title: true } });
    if (courses.length === 0) {
        courses = await prisma.course.findMany({ select: { id: true, title: true } });
    }
    if (courses.length === 0) {
        throw new Error('У базі немає жодного курсу — спершу створи/засідь курс, потім відгуки.');
    }
    console.log(`📚 Курсів знайдено: ${courses.length}`);

    // 2. Створюємо (або оновлюємо) мок-студентів.
    const users = [];
    for (const r of MOCK_REVIEWS) {
        const user = await prisma.user.upsert({
            where: { email: r.email },
            create: { email: r.email, name: r.name, role: 'STUDENT' },
            update: { name: r.name },
            select: { id: true, email: true },
        });
        users.push({ ...user, ...r });
    }
    console.log(`👤 Мок-студентів готово: ${users.length}`);

    // 3. Створюємо відгуки на кожен курс (кожен студент — один відгук на курс).
    let count = 0;
    for (const course of courses) {
        for (const u of users) {
            await prisma.review.upsert({
                where: { userId_courseId: { userId: u.id, courseId: course.id } },
                create: { userId: u.id, courseId: course.id, rating: u.rating, comment: u.comment },
                update: { rating: u.rating, comment: u.comment },
            });
            count++;
        }
        console.log(`   ✅ "${course.title}" — ${users.length} відгуків`);
    }

    console.log(`\n🎉 Готово! Створено/оновлено ${count} відгуків. Дивись у /dashboard/admin/reviews`);
}

main()
    .catch((e) => {
        console.error('❌ Помилка:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
