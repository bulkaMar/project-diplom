'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import CourseCard from '@/components/Course/CourseCard';
import { useT } from '@/lib/i18n';

export default function DashboardPage() {
    const tr = useT();
    const { user, token, isLoading: authLoading } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    // Aggregate progress across all courses
    const overallProgress = courses.length
        ? Math.round(
            courses.reduce((acc, c) => acc + (c.progressPercent || 0), 0) /
            courses.length
        )
        : 0;

    // Last accessed course (first one with some progress, or just first)
    const lastCourse =
        courses.find((c) => (c.progressPercent || 0) > 0) || courses[0];

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
            return;
        }

        if (!authLoading && user?.role === 'ADMIN') {
            router.replace('/dashboard/admin');
            return;
        }


        if (!authLoading && user?.role === 'TEACHER') {
            router.replace('/dashboard/editor');
            return;
        }

        const fetchCourses = async () => {
            if (authLoading || !user) return;
            try {
                const response = await api.get<any[]>('/courses', token || undefined);
                const detailed = await Promise.all(
                    response.map(async (course: any) => {
                        try {
                            return await api.get(
                                `/courses/${course.slug}`,
                                token || undefined
                            );
                        } catch {
                            return course;
                        }
                    })
                );
                setCourses(detailed);
            } catch (err: any) {
                setError(tr('Не вдалося завантажити курси. Переконайтесь, що сервер запущений.', 'Couldn’t load courses. Make sure the server is running.'));
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [token, authLoading, user]);

    // ---- Loading state ----
    if (authLoading || (loading && courses.length === 0) || !user) {
        return (
            <div className={styles.page}>
                <div className={styles.skeletonWrap}>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonGrid}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={styles.skeletonCard} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Ring math: r = 45% of viewBox(100) => circumference ≈ 282.7
    const circumference = 282.7;
    const offset = circumference - (overallProgress / 100) * circumference;

    return (
        <div className={styles.page}>
            {/* ---- Fresh Header ---- */}
            <header className={styles.simpleHeader}>
                <div className={styles.heroInner}>
                    <section className={styles.welcomeBanner}>
                        <div className={styles.bannerGlow} />
                        <div className={styles.bannerText}>
                            <span className={styles.bannerEyebrow}>{tr('Особистий кабінет', 'My dashboard')}</span>
                            <h1 className={styles.welcomeTitle}>
                                {tr('Привіт', 'Hi')}, {user?.name?.split(' ')[0] || tr('студенте', 'there')}! 👋
                            </h1>
                            <p className={styles.welcomeSubtitle}>
                                {tr('Продовжуйте своє навчання та вдосконалюйте навички C++.', 'Keep learning and sharpen your C++ skills.')}
                            </p>
                            <div className={styles.bannerStats}>
                                {[
                                    { icon: 'library_books', value: courses.length, label: tr('Курсів', 'Courses') },
                                    {
                                        icon: 'view_module',
                                        value: courses.reduce((n, c) => n + (c._count?.modules || c.modules?.length || 0), 0),
                                        label: tr('Модулів', 'Modules'),
                                    },
                                    {
                                        icon: 'task_alt',
                                        value: courses.reduce((n, c) => n + (c.totalLessons || 0), 0),
                                        label: tr('Уроків', 'Lessons'),
                                    },
                                ].map((s) => (
                                    <div key={s.label} className={styles.bannerStat}>
                                        <div className={styles.bannerStatIcon}>
                                            <span className="material-symbols-outlined">{s.icon}</span>
                                        </div>
                                        <div>
                                            <div className={styles.bannerStatValue}>{s.value}</div>
                                            <div className={styles.bannerStatLabel}>{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.bannerRing}>
                            <svg viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#5b8cff" />
                                        <stop offset="100%" stopColor="#22d3ee" />
                                    </linearGradient>
                                </defs>
                                <circle cx="50" cy="50" r="45" className={styles.ringTrack} />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    className={styles.ringValue}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                />
                            </svg>
                            <div className={styles.ringLabel}>
                                <span className={styles.ringPercent}>{overallProgress}%</span>
                                <span className={styles.ringCaption}>{tr('загальний прогрес', 'overall progress')}</span>
                            </div>
                        </div>
                    </section>

                    <h2 className={styles.sectionTitle}>{tr('Ваші курси', 'Your courses')}</h2>

                    {/* Grid immediately below */}
                    <div className={styles.gridContainer}>
                        {courses.length > 0 ? (
                            <div className={styles.coursesGrid}>
                                {courses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                {tr('Ви ще не зараховані на жоден курс.', 'You’re not enrolled in any course yet.')}
                                {tr('Зверніться до викладача для отримання доступу.', 'Ask your teacher for access.')}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ---- Course Overview Modal ---- */}
            {showModal && lastCourse && (
                <div
                    className={styles.modalOverlay}
                    onClick={(e) =>
                        e.target === e.currentTarget && setShowModal(false)
                    }
                >
                    <div className={styles.modalBox}>
                        <button
                            className={styles.modalClose}
                            onClick={() => setShowModal(false)}
                            aria-label={tr('Закрити', 'Close')}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <span className={styles.modalBadge}>{tr('КНУ · Підготовчий курс', 'KNU · Preparatory course')}</span>
                        <h2 className={styles.modalTitle}>{lastCourse.title}</h2>
                        <p className={styles.modalDesc}>
                            {tr('Цей курс розроблений спеціально для абітурієнтів факультету комп\'ютерних наук та кібернетики КНУ ім. Тараса Шевченка. Це твоя база перед початком навчання на першому курсі кафедри програмної інженерії.', 'This course was designed for applicants to the Faculty of Computer Science and Cybernetics at Taras Shevchenko National University of Kyiv. It’s your foundation before the first year of the Software Engineering programme.')}
                        </p>

                        {/* Stats */}
                        <div className={styles.modalStatsRow}>
                            <div className={styles.modalStat}>
                                <span className={styles.modalStatValue}>
                                    {lastCourse._count?.modules || 0}
                                </span>
                                <span className={styles.modalStatLabel}>{tr('Модулів', 'Modules')}</span>
                            </div>
                            <div className={styles.modalStat}>
                                <span className={styles.modalStatValue}>
                                    {lastCourse.totalLessons || 0}
                                </span>
                                <span className={styles.modalStatLabel}>{tr('Уроків', 'Lessons')}</span>
                            </div>
                            <div className={styles.modalStat}>
                                <span className={styles.modalStatValue}>
                                    {Math.round(lastCourse.progressPercent || 0)}%
                                </span>
                                <span className={styles.modalStatLabel}>{tr('Прогрес', 'Progress')}</span>
                            </div>
                        </div>

                        <div className={styles.modalDivider} />

                        {/* For whom */}
                        <div className={styles.modalSection}>
                            <p className={styles.modalSectionTitle}>{tr('Для кого цей курс', 'Who this course is for')}</p>
                            <ul className={styles.modalList}>
                                {[
                                    tr('Абітурієнтів КНУ ім. Тараса Шевченка (програмна інженерія)', 'Applicants to KNU (Software Engineering)'),
                                    tr('Новачків, які починають свій шлях у програмуванні', 'Beginners starting out in programming'),
                                    tr('Тих, хто хоче впевнено почуватися на перших парах', 'Anyone who wants to feel confident in their first classes'),
                                    tr('Майбутніх професіоналів, які прагнуть сильної бази', 'Future professionals who want a solid foundation'),
                                ].map((item) => (
                                    <li key={item} className={styles.modalListItem}>
                                        <span
                                            className={`material-symbols-outlined ${styles.modalListIcon}`}
                                        >
                                            check_circle
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.modalDivider} />

                        {/* What you'll learn */}
                        <div className={styles.modalSection}>
                            <p className={styles.modalSectionTitle}>{tr('Що ви отримаєте', 'What you’ll get')}</p>
                            <ul className={styles.modalList}>
                                {[
                                    tr('Фундаментальні знання синтаксису C++', 'A solid grasp of C++ syntax'),
                                    tr('Розуміння алгоритмічного мислення та логіки коду', 'Algorithmic thinking and code logic'),
                                    tr('Підготовку до основної програми університету', 'Preparation for the main university programme'),
                                    tr('Базову практику, на якій будується все подальше навчання', 'Core practice that everything else builds on'),
                                ].map((item) => (
                                    <li key={item} className={styles.modalListItem}>
                                        <span
                                            className={`material-symbols-outlined ${styles.modalListIcon}`}
                                        >
                                            bolt
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            className={styles.modalCta}
                            onClick={() => {
                                setShowModal(false);
                                router.push(`/dashboard/courses/${lastCourse.slug}`);
                            }}
                        >
                            <span>{tr('Перейти до курсу', 'Go to course')}</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
