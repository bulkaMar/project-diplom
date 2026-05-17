'use client';

import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, alpha } from '@mui/material';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { 
    People as PeopleIcon, 
    RateReview as ReviewIcon, 
    Code as CodeIcon, 
    Star as StarIcon,
    MenuBook as CourseIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminOverview() {
    const { token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchStats();
    }, [token]);

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

    const statCards = [
        { title: 'Користувачі', value: stats?.usersCount, icon: <PeopleIcon />, color: '#3b82f6' },
        { title: 'Курси', value: stats?.coursesCount, icon: <CourseIcon />, color: '#ec4899' },
        { title: 'Відгуки', value: stats?.reviewsCount, icon: <ReviewIcon />, color: '#10b981' },
        { title: 'Рішення', value: stats?.submissionsCount, icon: <CodeIcon />, color: '#8b5cf6' },
        { title: 'Сер. рейтинг', value: stats?.averageRating?.toFixed(1) || '0.0', icon: <StarIcon />, color: '#fbbf24' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
                gap: 3 
            }}>
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Paper sx={{
                            p: 3,
                            bgcolor: '#161b26',
                            borderRadius: 4,
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            height: '100%'
                        }}>
                            <Box sx={{
                                width: 56, height: 56, borderRadius: 3,
                                bgcolor: alpha(card.color, 0.1),
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: card.color,
                                border: `1px solid ${alpha(card.color, 0.2)}`
                            }}>
                                {React.cloneElement(card.icon as React.ReactElement<any>, { sx: { fontSize: 32 } })}
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900 }}>
                                    {card.value}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
                                    {card.title}
                                </Typography>
                            </Box>
                        </Paper>
                    </motion.div>
                ))}
            </Box>

            <Paper sx={{
                p: 4, 
                bgcolor: '#161b26', 
                borderRadius: 4, 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'center'
            }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>
                    Вітаємо в системі управління!
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', maxWidth: 600, mx: 'auto' }}>
                    Використовуйте вкладки вище для детального керування базою користувачів, контентом курсів та модерації відгуків. 
                    Інформація оновлюється в режимі реального часу.
                </Typography>
            </Paper>
        </Box>
    );
}
