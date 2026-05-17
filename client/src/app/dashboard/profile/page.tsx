'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './profile.module.css';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '@/lib/api';

interface Stats {
    courses: number;
    lessons: number;
    practices: number;
    avgScore: number;
}

interface AdminConfig {
    geminiApiKey: string;
    adviceSystemActive: boolean;
}

export default function ProfilePage() {
    const { user, token, isLoading: authLoading, refreshProfile } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<Stats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
    const [configLoading, setConfigLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
            return;
        }

        if (user) {
            setName(user.name || '');
            setEmail(user.email);
            if (user.role === 'ADMIN') {
                fetchAdminConfig();
            } else {
                fetchStats();
            }
        }
    }, [user, token, authLoading]);

    const fetchAdminConfig = async () => {
        if (!token) return;
        setConfigLoading(true);
        try {
            const data = await api.get<AdminConfig>('/admin/config', token);
            setAdminConfig(data);
        } catch (err) {
            console.error('Failed to fetch admin config', err);
        } finally {
            setConfigLoading(false);
        }
    };

    const fetchStats = async () => {
        if (!token) return;
        try {
            const data = await api.get<Stats>('/auth/stats', token);
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats', err);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!token || !user) return;
        setIsLoading(true);
        
        const updateData: any = {};
        if (name !== user.name) updateData.name = name;
        if (email !== user.email) updateData.email = email;

        if (Object.keys(updateData).length === 0) {
            setIsEditing(false);
            setIsLoading(false);
            return;
        }

        try {
            await api.patch('/auth/profile', updateData, token);
            await refreshProfile();
            setIsEditing(false);
        } catch (err: any) {
            console.error('Failed to update profile', err);
            const msg = err.response?.data?.message || 'Помилка при оновленні профілю';
            alert(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        if (!token || !adminConfig) return;
        setIsLoading(true);
        try {
            await api.patch('/admin/config', adminConfig, token);
            alert('Системні налаштування змінено');
        } catch (err) {
            console.error('Failed to save config', err);
            alert('Помилка збереження налаштувань');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || !user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    const getInitials = (userName: string) => {
        return userName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'Адміністратор';
            case 'TEACHER': return 'Викладач';
            case 'STUDENT': return 'Студент';
            case 'APPLICANT': return 'Абітурієнт';
            default: return role;
        }
    };

    return (
        <div className={styles.container}>
            <Box sx={{ mb: 4 }}>
                <Button
                    component={Link}
                    href="/dashboard"
                    startIcon={<ArrowBackIcon />}
                    sx={{ color: '#6e7589', textTransform: 'none', '&:hover': { color: '#fff' } }}
                >
                    Назад до дошки
                </Button>
            </Box>

            <header className={styles.header}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatarCircle}>
                        {user.name ? getInitials(user.name) : 'U'}
                    </div>
                    <div className={styles.avatarGlow}></div>
                </div>
                
                <div className={styles.titleSection}>
                    <h1>{user.name || 'Користувач'}</h1>
                    <p className={styles.email}>{user.email}</p>
                    <div className={styles.roleBadge}>
                        <ShieldIcon sx={{ fontSize: 16 }} />
                        {getRoleLabel(user.role)}
                    </div>
                </div>
            </header>

            <div className={styles.infoGrid}>
                {/* Account Details */}
                <section className={styles.card}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                            <BadgeIcon sx={{ color: '#3b82f6' }} />
                            Деталі акаунту
                        </h3>
                        {!isEditing && (
                            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                                Редагувати
                            </button>
                        )}
                    </Box>
                    
                    {!isEditing ? (
                        <div className={styles.detailsView}>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Повне ім'я</span>
                                <span className={styles.detailValue}>{user.name || 'Не вказано'}</span>
                            </div>

                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Електронна пошта</span>
                                <span className={styles.detailValue}>{user.email}</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.editSection}>
                            <div className={styles.detailRow}>
                                <label className={styles.detailLabel}>Повне ім'я</label>
                                <input 
                                    className={styles.editInput}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ваше ім'я"
                                />
                            </div>
                            <div className={styles.detailRow}>
                                <label className={styles.detailLabel}>Електронна пошта</label>
                                <input 
                                    className={styles.editInput}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className={styles.editActions}>
                                <button 
                                    className={styles.saveBtn} 
                                    onClick={handleSave}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Збереження...' : 'Зберегти зміни'}
                                </button>
                                <button 
                                    className={styles.cancelBtn} 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setName(user.name || '');
                                        setEmail(user.email);
                                    }}
                                    disabled={isLoading}
                                >
                                    Скасувати
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Right Card: Stats or Admin Settings */}
                <section className={styles.card}>
                    {user.role === 'ADMIN' ? (
                        <>
                            <h3 className={styles.cardTitle}>
                                <ShieldIcon sx={{ color: '#8197ff' }} />
                                Системні налаштування
                            </h3>
                            
                            {configLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : adminConfig ? (
                                <div className={styles.editSection}>
                                    <div className={styles.detailRow} style={{ borderBottom: '1px solid rgba(129, 151, 255, 0.1)', paddingBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <label className={styles.detailLabel} style={{ marginBottom: '0.2rem' }}>Система порад (ШІ)</label>
                                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Вимкнення підказок для всіх студентів</span>
                                            </div>
                                            <div 
                                                className={`${styles.cyberToggle} ${adminConfig.adviceSystemActive ? styles.toggleActive : ''}`}
                                                onClick={() => setAdminConfig({...adminConfig, adviceSystemActive: !adminConfig.adviceSystemActive})}
                                            >
                                                <div className={styles.toggleTrack}>
                                                    <div className={styles.toggleThumb}></div>
                                                </div>
                                                <span className={styles.toggleStatusLabel}>
                                                    {adminConfig.adviceSystemActive ? 'ACTIVE' : 'OFFLINE'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.detailRow} style={{ marginTop: '1rem' }}>
                                        <label className={styles.detailLabel}>Gemini API Ключ</label>
                                        <input 
                                            className={styles.editInput}
                                            type="password"
                                            value={adminConfig.geminiApiKey || ''}
                                            onChange={(e) => setAdminConfig({...adminConfig, geminiApiKey: e.target.value})}
                                            placeholder="Введіть ваш ключ..."
                                        />
                                    </div>
                                    <button 
                                        className={styles.saveBtn} 
                                        style={{ marginTop: '1rem' }}
                                        onClick={handleSaveConfig}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Збереження...' : 'Зберегти глобальні налаштування'}
                                    </button>
                                </div>
                            ) : (
                                <Typography color="error" variant="body2">Не вдалося завантажити налаштування</Typography>
                            )}
                        </>
                    ) : (
                        <>
                            <h3 className={styles.cardTitle}>
                                <AccountCircleIcon sx={{ color: '#8197ff' }} />
                                Статистика навчання
                            </h3>
                            
                            {statsLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : stats ? (
                                <div className={styles.statsGrid}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statNumber}>{stats.courses}</span>
                                        <span className={styles.statLabel}>Курсів</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statNumber}>{stats.lessons}</span>
                                        <span className={styles.statLabel}>Уроків</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statNumber}>{stats.practices}</span>
                                        <span className={styles.statLabel}>Практик</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statNumber}>{stats.avgScore}%</span>
                                        <span className={styles.statLabel}>Середній бал</span>
                                    </div>
                                </div>
                            ) : (
                                <Typography color="error" variant="body2">Не вдалося завантажити статистику</Typography>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
