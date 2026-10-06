'use client';

import { useState } from 'react';
import Link from 'next/link';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import styles from '../login/login.module.css';
import localStyles from './forgot.module.css';
import { useT } from '@/lib/i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ForgotPasswordPage() {
    const tr = useT();
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
            if (!res.ok) throw new Error(tr('Помилка запиту', 'Request failed'));
            setSent(true);
        } catch {
            setError(tr('Помилка. Спробуйте ще раз.', 'Something went wrong. Please try again.'));
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
                        {sent ? tr('Лист надіслано', 'Email sent') : tr('Забули пароль?', 'Forgot password?')}
                    </h1>
                    <p className={styles.subtitle}>
                        {sent
                            ? tr('Перевірте свою пошту та перейдіть за посиланням', 'Check your inbox and follow the link')
                            : tr('Введіть свій email і ми надішлемо посилання для скидання пароля', 'Enter your email and we’ll send you a password reset link')}
                    </p>
                </div>

                <div className={styles.card}>
                    {sent ? (
                        <div className={localStyles.successBox}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#4ade80', mb: 2 }} />
                            <p>
                                {tr('Якщо акаунт з адресою', 'If an account with')} <strong>{email}</strong>{' '}
                                {tr('існує, ви отримаєте лист протягом кількох хвилин.', 'exists, you’ll receive an email within a few minutes.')}
                            </p>
                            <p className={localStyles.noteText}>{tr('Посилання дійсне протягом 1 години. Перевірте папку «Спам», якщо лист не з\'явився.', 'The link is valid for 1 hour. Check your Spam folder if the email doesn’t arrive.')}</p>
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
                                        {tr('Електронна пошта', 'Email')}
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
                                    {loading ? tr('Надсилання...', 'Sending...') : tr('НАДІСЛАТИ ПОСИЛАННЯ', 'SEND LINK')}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <p className={styles.footerText}>
                    <Link href="/login" className={localStyles.backLink}>
                        <ArrowBackIcon style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }} />
                        {tr('Повернутись до входу', 'Back to login')}
                    </Link>
                </p>
            </main>
        </div>
    );
}
