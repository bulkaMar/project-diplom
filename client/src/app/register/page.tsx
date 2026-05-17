'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import styles from './register.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Паролі не співпадають');
            return;
        }

        try {
            await register({ name, email, password });
        } catch (err: any) {
            setError(err.message || 'Помилка реєстрації. Будь ласка, спробуйте ще раз.');
        }
    };

    return (
        <div className={styles.page}>
            {/* Abstract Background Elements */}
            <div className={styles.bgBlob1} />
            <div className={styles.bgBlob2} />

            {/* Registration Container */}
            <main className={styles.container}>
                <div className={styles.card}>

                    {/* Brand Anchor */}
                    <div className={styles.brandHeader}>
                        <h2 className={styles.brandTitle}>Реєстрація</h2>
                        <p className={styles.brandSubtitle}>
                            Станьте частиною спільноти C++ архітекторів
                        </p>
                    </div>

                    {error && (
                        <div className={styles.errorBox}>
                            <LockOutlinedIcon fontSize="small" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Name Field */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Повне ім'я</label>
                            <div className={styles.inputWrapper}>
                                <PersonOutlineIcon className={styles.inputIcon} />
                                <input
                                    className={styles.input}
                                    placeholder="Олександр Коваленко"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Електронна пошта</label>
                            <div className={styles.inputWrapper}>
                                <AlternateEmailIcon className={styles.inputIcon} />
                                <input
                                    className={styles.input}
                                    placeholder="architect@kinetic.io"
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password + Confirm (2 cols on desktop) */}
                        <div className={styles.passwordGrid}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Пароль</label>
                                <div className={styles.inputWrapper}>
                                    <LockOpenIcon className={styles.inputIcon} />
                                    <input
                                        className={styles.input}
                                        placeholder="••••••••"
                                        required
                                        minLength={8}
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Підтвердження</label>
                                <div className={styles.inputWrapper}>
                                    <VerifiedUserIcon className={styles.inputIcon} />
                                    <input
                                        className={styles.input}
                                        placeholder="••••••••"
                                        required
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <button type="submit" className={styles.submitBtn}>
                            <span>Створити акаунт</span>
                            <ArrowForwardIcon fontSize="small" />
                        </button>
                    </form>

                    {/* Divider */}
                    <div className={styles.divider}>
                        <div className={styles.dividerInner}>
                            <hr className={styles.dividerLine} />
                        </div>
                        <div className={styles.dividerLabelWrap}>
                            <span className={styles.dividerLabel}>Або зареєструйтесь через</span>
                        </div>
                    </div>

                    {/* Social Registration */}
                    <div
                        className={styles.socialBtnFull}
                        onClick={() => (window.location.href = `${API_URL}/auth/google`)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className={styles.socialLabel}>Зареєструватись через Google</span>
                    </div>

                    {/* Footer Link */}
                    <div className={styles.footerText}>
                        <p className={styles.footerP}>
                            Вже маєте акаунт?
                            <Link className={styles.footerLink} href="/login">
                                Увійти
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Security Footnote */}
                <div className={styles.securityBadges}>
                    <div className={styles.badge}>
                        <LockOutlinedIcon fontSize="small" />
                        <span className={styles.badgeText}>End-to-End Encryption</span>
                    </div>
                    <div className={styles.badge}>
                        <ShieldOutlinedIcon fontSize="small" />
                        <span className={styles.badgeText}>GDPR Compliant</span>
                    </div>
                </div>
            </main>


        </div>
    );
}
