'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import CourseCard from '@/components/Course/CourseCard';

export default function DashboardPage() {
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
                setError('Не вдалося завантажити курси. Переконайтесь, що сервер запущений.');
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
                    <h1 className={styles.welcomeTitle}>
                        Привіт, {user?.name?.split(' ')[0] || 'студенте'}! 👋
                    </h1>
                    <p className={styles.welcomeSubtitle}>
                        Продовжуйте своє навчання та вдосконалюйте навички C++.
                    </p>

                    <h2 className={styles.sectionTitle}>Ваші курси</h2>

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
                                Ви ще не зараховані на жоден курс.
                                Зверніться до викладача для отримання доступу.
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
                            aria-label="Закрити"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <span className={styles.modalBadge}>КНУ · Підготовчий курс</span>
                        <h2 className={styles.modalTitle}>{lastCourse.title}</h2>
                        <p className={styles.modalDesc}>
                            Цей курс розроблений спеціально для абітурієнтів факультету комп'ютерних наук та кібернетики КНУ ім. Тараса Шевченка. Це твоя база перед початком навчання на першому курсі кафедри програмної інженерії.
                        </p>

                        {/* Stats */}
                        <div className={styles.modalStatsRow}>
                            <div className={styles.modalStat}>
                                <span className={styles.modalStatValue}>
                                    {lastCourse._count?.modules || 0}
                                </span>
                                <span className={styles.modalStatLabel}>Модулів</span>
                            </div>
                            <div className={styles.modalStat}>
                                <span className={styles.modalStatValue}>
                                    {lastCourse.totalLessons || 0}
                                </span>
                                <span className={styles.modalStatLabel}>Уроків</span>
                            </div>
                            <div className={styles.modalStat}>
                                <span className={styles.modalStatValue}>
                                    {Math.round(lastCourse.progressPercent || 0)}%
                                </span>
                                <span className={styles.modalStatLabel}>Прогрес</span>
                            </div>
                        </div>

                        <div className={styles.modalDivider} />

                        {/* For whom */}
                        <div className={styles.modalSection}>
                            <p className={styles.modalSectionTitle}>Для кого цей курс</p>
                            <ul className={styles.modalList}>
                                {[
                                    'Абітурієнтів КНУ ім. Тараса Шевченка (програмна інженерія)',
                                    'Новачків, які починають свій шлях у програмуванні',
                                    'Тих, хто хоче впевнено почуватися на перших парах',
                                    'Майбутніх професіоналів, які прагнуть сильної бази',
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
                            <p className={styles.modalSectionTitle}>Що ви отримаєте</p>
                            <ul className={styles.modalList}>
                                {[
                                    'Фундаментальні знання синтаксису C++',
                                    'Розуміння алгоритмічного мислення та логіки коду',
                                    'Підготовку до основної програми університету',
                                    'Базову практику, на якій будується все подальше навчання',
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
                            <span>Перейти до курсу</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
