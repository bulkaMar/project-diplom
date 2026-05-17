'use client';

import { useState } from 'react';
import Link from 'next/link';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import styles from '../login/login.module.css';
import localStyles from './forgot.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error('Помилка запиту');
            setSent(true);
        } catch {
            setError('Помилка. Спробуйте ще раз.');
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
                        {sent ? 'Лист надіслано' : 'Забули пароль?'}
                    </h1>
                    <p className={styles.subtitle}>
                        {sent
                            ? 'Перевірте свою пошту та перейдіть за посиланням'
                            : 'Введіть свій email і ми надішлемо посилання для скидання пароля'}
                    </p>
                </div>

                <div className={styles.card}>
                    {sent ? (
                        <div className={localStyles.successBox}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#4ade80', mb: 2 }} />
                            <p>Якщо акаунт з адресою <strong>{email}</strong> існує, ви отримаєте лист протягом кількох хвилин.</p>
                            <p className={localStyles.noteText}>Посилання дійсне протягом 1 години. Перевірте папку «Спам», якщо лист не з'явився.</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className={styles.errorBox}>
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label} htmlFor="email">
                                        Електронна пошта
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <MailOutlineIcon className={styles.inputIcon} />
                                        <input
                                            id="email"
                                            className={styles.input}
                                            type="email"
                                            required
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={loading}
                                >
                                    {loading ? 'Надсилання...' : 'НАДІСЛАТИ ПОСИЛАННЯ'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <p className={styles.footerText}>
                    <Link href="/login" className={localStyles.backLink}>
                        <ArrowBackIcon style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }} />
                        Повернутись до входу
                    </Link>
                </p>
            </main>
        </div>
    );
}
