'use client';

import React from 'react';
import {
    Box, Typography, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Chip, Paper, Grid, Divider, Button
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CodeIcon from '@mui/icons-material/Code';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Lesson {
    id: string;
    slug: string;
    title: string;
    type: string;
    difficulty: string;
    isCompleted: boolean;
    score?: number | null;
}

interface DifficultyLevel {
    unlocked: boolean;
    completed: boolean;
    lessons: Lesson[];
}

interface DifficultyStatusData {
    BASIC: DifficultyLevel;
    STANDARD: DifficultyLevel;
    ADVANCED: DifficultyLevel;
}

interface DifficultyTabsProps {
    data: DifficultyStatusData;
}

const LEVELS = [
    { key: 'BASIC', label: 'Базовий', id: '01' },
    { key: 'STANDARD', label: 'Стандартний', id: '02' },
    { key: 'ADVANCED', label: 'Просунутий', id: '03' },
] as const;

type DifficultyKey = typeof LEVELS[number]['key'];

export default function DifficultyTabs({ data }: DifficultyTabsProps) {
    const router = useRouter();
    
    // Filter out levels that have no lessons
    const visibleLevels = LEVELS.filter(level => data[level.key].lessons.length > 0);
    
    const [activeTab, setActiveTab] = React.useState<DifficultyKey>(
        visibleLevels.length > 0 ? visibleLevels[0].key : 'BASIC'
    );

    const currentLevelData = data[activeTab];

    const getLessonIcon = (type: string, completed: boolean, score?: number | null) => {
        if (completed) return (
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '50%', bgcolor: 'rgba(16, 185, 129, 0.1)'
            }}>
                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
            </Box>
        );

        const iconStyle = { color: 'text.secondary', fontSize: 24 };
        
        if (!completed && score !== undefined && score !== null) {
            return (
                <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: '50%', bgcolor: 'rgba(239, 68, 68, 0.1)'
                }}>
                    <CancelIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                </Box>
            );
        }

        switch (type) {
            case 'QUIZ': return <HelpOutlineIcon sx={iconStyle} />;
            case 'PRACTICE': return <CodeIcon sx={iconStyle} />;
            default: return <PlayCircleOutlineIcon sx={iconStyle} />;
        }
    };

    // If no levels have lessons, show nothing or a simplified list
    if (visibleLevels.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#0f172a', borderRadius: 4 }}>
                <Typography sx={{ color: 'text.secondary' }}>У цьому модулі ще немає завдань.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#0f172a', borderRadius: 4, minHeight: 400 }}>
            {/* Header Info */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="overline" sx={{ color: '#3b82f6', fontWeight: 700, letterSpacing: 1 }}>
                    МОДУЛЬ • {visibleLevels.length} {visibleLevels.length === 1 ? 'РІВЕНЬ' : 'РІВНІ'}
                </Typography>
            </Box>

            {/* Level Selector Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {visibleLevels.map((level) => {
                    const levelInfo = data[level.key];
                    const isActive = activeTab === level.key;
                    const isLocked = !levelInfo.unlocked;

                    return (
                        <Grid size={{ xs: 12, md: 12 / Math.min(visibleLevels.length, 3) }} key={level.key}>
                            <Paper
                                component={motion.div}
                                whileHover={!isLocked ? { y: -4 } : {}}
                                onClick={() => !isLocked && setActiveTab(level.key)}
                                sx={{
                                    p: 2.5,
                                    bgcolor: isActive ? 'rgba(59, 130, 246, 0.05)' : '#1e293b',
                                    border: '1px solid',
                                    borderColor: isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 3,
                                    cursor: isLocked ? 'not-allowed' : 'pointer',
                                    position: 'relative',
                                    transition: 'all 0.2s ease-in-out',
                                    opacity: isLocked ? 0.6 : 1,
                                    boxShadow: isActive ? '0 0 20px rgba(59, 130, 246, 0.15)' : 'none',
                                    overflow: 'hidden'
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="caption" sx={{ color: isActive ? '#3b82f6' : 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
                                        РІВЕНЬ {level.id}
                                    </Typography>
                                    {levelInfo.completed ? (
                                        <EmojiEventsIcon sx={{ color: '#fbbf24', fontSize: 20 }} />
                                    ) : isLocked ? (
                                        <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: 18 }} />
                                    ) : null}
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: isActive ? '#fff' : 'rgba(255,255,255,0.7)', mb: 1 }}>
                                    {level.label}
                                </Typography>

                                {isActive && (
                                    <Box sx={{
                                        position: 'absolute', bottom: 0, left: 0, right: 0,
                                        height: 3, bgcolor: '#3b82f6',
                                        boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                                    }} />
                                )}
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Achievement Toast (Optional/Based on current level) */}
            {currentLevelData.completed && (
                <Box sx={{
                    p: 2, mb: 4, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'flex', alignItems: 'center', gap: 2
                }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
                        <EmojiEventsIcon sx={{ color: '#10b981' }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 700 }}>
                            Вітаємо! Ви опанували цей рівень
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(16, 185, 129, 0.8)' }}>
                            Всі завдання виконано успішно. Ви готові до наступного етапу.
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Task List Section */}
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, mt: 2, color: '#fff' }}>
                Список завдань
            </Typography>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {currentLevelData.lessons.map((lesson) => (
                            <ListItem
                                key={lesson.id}
                                disablePadding
                                sx={{
                                    bgcolor: '#1e293b',
                                    borderRadius: 4,
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { bgcolor: '#242f42', borderColor: 'rgba(59, 130, 246, 0.2)' }
                                }}
                            >
                                <ListItemButton
                                    onClick={() => router.push(`/dashboard/lessons/${lesson.slug}`)}
                                    sx={{ px: 3, py: 2.2 }}
                                >
                                    <ListItemIcon sx={{ minWidth: 56 }}>
                                        {lesson.isCompleted ? (
                                            <Box sx={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(16, 185, 129, 0.15)',
                                                border: '1px solid rgba(16, 185, 129, 0.2)'
                                            }}>
                                                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                width: 36, height: 36, borderRadius: '50%', 
                                                bgcolor: lesson.score !== null ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid',
                                                borderColor: lesson.score !== null ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)'
                                            }}>
                                                {getLessonIcon(lesson.type, false, lesson.score)}
                                            </Box>
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                                                {lesson.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                {lesson.type === 'THEORY' ? 'КОНСПЕКТ' :
                                                    lesson.type === 'PRACTICE' ? 'ПРАКТИКА' : 'ТЕСТ'}
                                                {' • '}
                                                {lesson.type === 'THEORY' ? '10 хв' :
                                                    lesson.type === 'PRACTICE' ? '20 хв' : '15 хв'}
                                            </Typography>
                                        }
                                    />
                                    {lesson.isCompleted ? (
                                        <Chip
                                            label={lesson.score !== null ? `Виконано (${lesson.score}%)` : "Виконано"}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(16, 185, 129, 0.1)',
                                                color: '#10b981',
                                                fontWeight: 800,
                                                borderRadius: 2,
                                                fontSize: '0.7rem',
                                                height: 24,
                                                px: 1
                                            }}
                                        />
                                    ) : lesson.score !== null ? (
                                        <Chip
                                            label={`Зафейлено (${lesson.score}%)`}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                fontWeight: 800,
                                                borderRadius: 2,
                                                fontSize: '0.7rem',
                                                height: 24,
                                                px: 1
                                            }}
                                        />
                                    ) : null}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </motion.div>
            </AnimatePresence>

            {/* Footer Logic (Hint) */}
            <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontWeight: 500 }}>
                    Наступний рівень стане доступним після завершення поточного
                </Typography>

                {data.BASIC.completed && (
                    <Button
                        variant="contained"
                        endIcon={<span>→</span>}
                        sx={{
                            bgcolor: '#2563eb',
                            '&:hover': { bgcolor: '#1d4ed8' },
                            borderRadius: 2.5,
                            px: 3,
                            py: 1,
                            fontWeight: 700,
                            textTransform: 'none'
                        }}
                    >
                        До наступного модуля
                    </Button>
                )}
            </Box>
        </Box>
    );
}
