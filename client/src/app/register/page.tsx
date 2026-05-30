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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import styles from './register.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Suggested groups for autocomplete
const GROUP_SUGGESTIONS = ['ІПЗ-13', 'ІПЗ-23', 'ІПЗ-33', 'ІПЗ-43'];

// ─── Validation helpers ───────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GROUP_REGEX = /^[А-ЯҐЄІЇa-zA-ZА-Яа-яёА-Яа-я]{2,6}-\d{2}$/i;

function validateEmail(v: string) {
    if (!v) return 'Введіть email';
    if (!EMAIL_REGEX.test(v)) return 'Невірний формат email (наприклад: user@example.com)';
    return '';
}
function validateName(v: string) {
    if (!v.trim()) return "Введіть ваше ім'я";
    if (v.trim().length < 2) return "Ім'я має бути не менше 2 символів";
    if (v.trim().length > 50) return "Ім'я занадто довге";
    return '';
}
function validatePassword(v: string) {
    if (!v) return 'Введіть пароль';
    if (v.length < 8) return 'Мінімум 8 символів';
    if (!/[A-Z]/.test(v)) return 'Потрібна хоча б одна велика літера';
    if (!/[a-z]/.test(v)) return 'Потрібна хоча б одна мала літера';
    if (!/\d/.test(v)) return 'Потрібна хоча б одна цифра';
    return '';
}
function validateConfirm(password: string, confirm: string) {
    if (!confirm) return 'Підтвердіть пароль';
    if (password !== confirm) return 'Паролі не співпадають';
    return '';
}
function validateGroup(v: string) {
    if (!v) return 'Введіть номер групи';
    if (!GROUP_REGEX.test(v.trim())) return 'Формат: ІПЗ-13 (літери-цифри)';
    return '';
}

// ─── Password strength ────────────────────────────────────────────────────────
function getPasswordStrength(v: string): { label: string; color: string; width: string } {
    if (!v) return { label: '', color: '#334155', width: '0%' };
    let score = 0;
    if (v.length >= 8) score++;
    if (v.length >= 12) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[a-z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;

    if (score <= 2) return { label: 'Слабкий', color: '#ef4444', width: '25%' };
    if (score <= 3) return { label: 'Середній', color: '#f59e0b', width: '50%' };
    if (score <= 4) return { label: 'Хороший', color: '#3b82f6', width: '75%' };
    return { label: 'Надійний', color: '#10b981', width: '100%' };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [groupName, setGroupName] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false, group: false });
    const [submitError, setSubmitError] = useState('');
    const { register } = useAuth();

    const nameErr     = validateName(name);
    const emailErr    = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr  = validateConfirm(password, confirmPassword);
    const groupErr    = validateGroup(groupName);
    const strength    = getPasswordStrength(password);
    const hasErrors   = !!(nameErr || emailErr || passwordErr || confirmErr || groupErr);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({ name: true, email: true, password: true, confirm: true, group: true });
        if (hasErrors) return;
        setSubmitError('');
        try {
            await register({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                groupName: groupName.trim().toUpperCase(),
            });
        } catch (err: any) {
            setSubmitError(err.message || 'Помилка реєстрації. Спробуйте ще раз.');
        }
    };

    const touch = (field: keyof typeof touched) =>
        setTouched(prev => ({ ...prev, [field]: true }));

    const filteredSuggestions = GROUP_SUGGESTIONS.filter(g =>
        g.toLowerCase().includes(groupName.toLowerCase()) && g !== groupName
    );

    return (
        <div className={styles.page}>
            <div className={styles.bgBlob1} />
            <div className={styles.bgBlob2} />

            <main className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.brandHeader}>
                        <h2 className={styles.brandTitle}>Реєстрація</h2>
                        <p className={styles.brandSubtitle}>Станьте частиною спільноти C++ архітекторів</p>
                    </div>

                    {submitError && (
                        <div className={styles.errorBox}>
                            <LockOutlinedIcon fontSize="small" />
                            {submitError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form} noValidate>

                        {/* Name */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Повне ім'я</label>
                            <div className={`${styles.inputWrapper} ${touched.name && nameErr ? styles.inputError : touched.name && !nameErr ? styles.inputSuccess : ''}`}>
                                <PersonOutlineIcon className={styles.inputIcon} />
                                <input
                                    className={styles.input}
                                    placeholder="Олександр Коваленко"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={() => touch('name')}
                                />
                                {touched.name && (nameErr
                                    ? <CancelOutlinedIcon className={styles.validationIconError} />
                                    : <CheckCircleOutlineIcon className={styles.validationIconSuccess} />
                                )}
                            </div>
                            {touched.name && nameErr && <p className={styles.fieldError}>{nameErr}</p>}
                        </div>

                        {/* Email */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Електронна пошта</label>
                            <div className={`${styles.inputWrapper} ${touched.email && emailErr ? styles.inputError : touched.email && !emailErr ? styles.inputSuccess : ''}`}>
                                <AlternateEmailIcon className={styles.inputIcon} />
                                <input
                                    className={styles.input}
                                    placeholder="architect@kinetic.io"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => touch('email')}
                                />
                                {touched.email && (emailErr
                                    ? <CancelOutlinedIcon className={styles.validationIconError} />
                                    : <CheckCircleOutlineIcon className={styles.validationIconSuccess} />
                                )}
                            </div>
                            {touched.email && emailErr && <p className={styles.fieldError}>{emailErr}</p>}
                        </div>

                        {/* Group */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Номер групи</label>
                            <div className={`${styles.inputWrapper} ${touched.group && groupErr ? styles.inputError : touched.group && !groupErr ? styles.inputSuccess : ''}`} style={{ position: 'relative' }}>
                                <GroupsOutlinedIcon className={styles.inputIcon} />
                                <input
                                    className={styles.input}
                                    placeholder="ІПЗ-13"
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => {
                                        setGroupName(e.target.value.toUpperCase());
                                        setShowSuggestions(true);
                                    }}
                                    onBlur={() => {
                                        touch('group');
                                        setTimeout(() => setShowSuggestions(false), 150);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    autoComplete="off"
                                />
                                {touched.group && (groupErr
                                    ? <CancelOutlinedIcon className={styles.validationIconError} />
                                    : <CheckCircleOutlineIcon className={styles.validationIconSuccess} />
                                )}
                                {/* Autocomplete dropdown */}
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <div className={styles.suggestionList}>
                                        {filteredSuggestions.map(g => (
                                            <button
                                                key={g}
                                                type="button"
                                                className={styles.suggestionItem}
                                                onMouseDown={() => {
                                                    setGroupName(g);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                <GroupsOutlinedIcon style={{ fontSize: 14, opacity: 0.5 }} />
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {touched.group && groupErr
                                ? <p className={styles.fieldError}>{groupErr}</p>
                                : <p className={styles.fieldHint}>Наприклад: ІПЗ-13, ІПЗ-23, ІПЗ-33, ІПЗ-43</p>
                            }
                        </div>

                        {/* Password */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Пароль</label>
                            <div className={`${styles.inputWrapper} ${touched.password && passwordErr ? styles.inputError : touched.password && !passwordErr ? styles.inputSuccess : ''}`}>
                                <LockOpenIcon className={styles.inputIcon} />
                                <input
                                    className={styles.input}
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={() => touch('password')}
                                />
                                {touched.password && (passwordErr
                                    ? <CancelOutlinedIcon className={styles.validationIconError} />
                                    : <CheckCircleOutlineIcon className={styles.validationIconSuccess} />
                                )}
                            </div>
                            {password && (
                                <div className={styles.strengthBar}>
                                    <div className={styles.strengthTrack}>
                                        <div className={styles.strengthFill} style={{ width: strength.width, backgroundColor: strength.color, transition: 'width 0.3s ease' }} />
                                    </div>
                                    <span className={styles.strengthLabel} style={{ color: strength.color }}>{strength.label}</span>
                                </div>
                            )}
                            {touched.password && passwordErr && <p className={styles.fieldError}>{passwordErr}</p>}
                        </div>

                        {/* Confirm password */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Підтвердження пароля</label>
                            <div className={`${styles.inputWrapper} ${touched.confirm && confirmErr ? styles.inputError : touched.confirm && !confirmErr ? styles.inputSuccess : ''}`}>
                                <VerifiedUserIcon className={styles.inputIcon} />
                                <input
                                    className={styles.input}
                                    placeholder="••••••••"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={() => touch('confirm')}
                                />
                                {touched.confirm && (confirmErr
                                    ? <CancelOutlinedIcon className={styles.validationIconError} />
                                    : <CheckCircleOutlineIcon className={styles.validationIconSuccess} />
                                )}
                            </div>
                            {touched.confirm && confirmErr && <p className={styles.fieldError}>{confirmErr}</p>}
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            <span>Створити акаунт</span>
                            <ArrowForwardIcon fontSize="small" />
                        </button>
                    </form>

                    {/* Divider */}
                    <div className={styles.divider}>
                        <div className={styles.dividerInner}><hr className={styles.dividerLine} /></div>
                        <div className={styles.dividerLabelWrap}>
                            <span className={styles.dividerLabel}>Або зареєструйтесь через</span>
                        </div>
                    </div>

                    {/* Google */}
                    <div className={styles.socialBtnFull} onClick={() => (window.location.href = `${API_URL}/auth/google`)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className={styles.socialLabel}>Зареєструватись через Google</span>
                    </div>

                    <div className={styles.footerText}>
                        <p className={styles.footerP}>
                            Вже маєте акаунт?
                            <Link className={styles.footerLink} href="/login"> Увійти</Link>
                        </p>
                    </div>
                </div>

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
