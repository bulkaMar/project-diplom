'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import styles from '../login/login.module.css';
import localStyles from '../forgot-password/forgot.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
    if (password.length === 0) return { level: 0, label: '', color: 'transparent' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
        { level: 1, label: 'Слабкий', color: '#ef4444' },
        { level: 2, label: 'Середній', color: '#f59e0b' },
        { level: 3, label: 'Хороший', color: '#3b82f6' },
        { level: 4, label: 'Надійний', color: '#10b981' },
    ];
    return levels[Math.min(score - 1, 3)] || levels[0];
}

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const strength = getPasswordStrength(password);

    useEffect(() => {
        if (!token) {
            router.replace('/forgot-password');
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setError('Паролі не співпадають');
            return;
        }
        if (password.length < 8) {
            setError('Пароль має містити щонайменше 8 символів');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Помилка скидання пароля');
            setDone(true);
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.bgBlob1} />
            <div className={styles.bgBlob2} />
            <div className={styles.bgGrid} />

            <main className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        {done ? 'Пароль змінено!' : 'Новий пароль'}
                    </h1>
                    <p className={styles.subtitle}>
                        {done
                            ? 'Зараз вас перенаправить на сторінку входу...'
                            : 'Придумайте надійний пароль для вашого акаунта'}
                    </p>
                </div>

                <div className={styles.card}>
                    {done ? (
                        <div className={localStyles.successBox}>
                            <CheckCircleOutlineIcon style={{ fontSize: 56, color: '#4ade80', display: 'block', margin: '0 auto 1.5rem' }} />
                            <p>Ваш пароль було успішно оновлено. Використовуйте його для наступного входу.</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className={styles.errorBox}>
                                    <LockOutlinedIcon fontSize="small" />
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className={styles.form}>
                                {/* New password */}
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label} htmlFor="password">
                                        Новий пароль
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <LockOutlinedIcon className={styles.inputIcon} />
                                        <input
                                            id="password"
                                            className={styles.input}
                                            type={showPass ? 'text' : 'password'}
                                            required
                                            placeholder="Мінімум 8 символів"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            style={{ paddingRight: '3rem' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(v => !v)}
                                            style={{
                                                position: 'absolute', right: '1rem', top: '50%',
                                                transform: 'translateY(-50%)', background: 'none',
                                                border: 'none', cursor: 'pointer', color: '#6e7589', padding: 0
                                            }}
                                        >
                                            {showPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                        </button>
                                    </div>
                                    {/* Strength bar */}
                                    {password.length > 0 && (
                                        <div>
                                            <div className={localStyles.strengthBar}>
                                                <div
                                                    className={localStyles.strengthFill}
                                                    style={{
                                                        width: `${(strength.level / 4) * 100}%`,
                                                        background: strength.color
                                                    }}
                                                />
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: strength.color, marginTop: 4 }}>
                                                {strength.label}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label} htmlFor="confirm">
                                        Підтвердіть пароль
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <LockOutlinedIcon className={styles.inputIcon} />
                                        <input
                                            id="confirm"
                                            className={styles.input}
                                            type={showPass ? 'text' : 'password'}
                                            required
                                            placeholder="Повторіть пароль"
                                            value={confirm}
                                            onChange={e => setConfirm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={loading}
                                >
                                    {loading ? 'Збереження...' : 'ЗБЕРЕГТИ ПАРОЛЬ'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {!done && (
                    <p className={styles.footerText}>
                        <Link href="/forgot-password" className={localStyles.backLink}>
                            Запросити нове посилання
                        </Link>
                    </p>
                )}
            </main>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={null}>
            <ResetPasswordForm />
        </Suspense>
    );
}
