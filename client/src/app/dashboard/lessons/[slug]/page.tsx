'use client';

import React, { useEffect, useState, use } from 'react';
import { Container, Typography, Box, Paper, Button, Divider, CircularProgress, Alert, Grid, Tabs, Tab, Fab, useTheme, useMediaQuery } from '@mui/material';
import Editor from '@monaco-editor/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import CodeIcon from '@mui/icons-material/Code';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TerminalIcon from '@mui/icons-material/Terminal';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/Home';
import BugReportIcon from '@mui/icons-material/BugReport';
import SendIcon from '@mui/icons-material/Send';
import QuizView from '@/components/Lesson/QuizView';
import TheoryView from '@/components/Lesson/TheoryView';
import { api } from '@/lib/api';

export default function LessonPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
    const params = use(paramsPromise);
    const router = useRouter();
    const { token, isLoading: authLoading } = useAuth();
    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [runOutput, setRunOutput] = useState<{ cases: { index: number; input: string; stdout: string; stderr: string; expected: string; passed: boolean; exitCode: number }[] } | null>(null);
    const [lastAction, setLastAction] = useState<'run' | 'submit' | null>(null);
    const [activeCaseTab, setActiveCaseTab] = useState(0);
    const [isDifficultyLocked, setIsDifficultyLocked] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [courseSlug, setCourseSlug] = useState<string | null>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    useEffect(() => {
        const fetchLesson = async () => {
            if (authLoading || !token) return;
            try {
                const lessonData = await api.get<any>(`/lessons/${params.slug}`, token || undefined);
                setLesson(lessonData);
                setCode(lessonData.initialCode || '');
                if (lessonData.module?.course?.slug) {
                    setCourseSlug(lessonData.module.course.slug);
                }

                const difficultyStatus = await api.get<any>(`/lessons/module/${lessonData.moduleId}/difficulty-status`, token || undefined);
                const lessonDiff = lessonData.difficulty as 'BASIC' | 'STANDARD' | 'ADVANCED';

                if (lessonDiff && difficultyStatus[lessonDiff]) {
                    setIsDifficultyLocked(!difficultyStatus[lessonDiff].unlocked);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [params.slug, token, authLoading]);

    /** Run — compiles & executes via Godbolt, returns stdout. No tests, no AI. */
    const handleRunCode = async () => {
        setIsRunning(true);
        setRunOutput(null);
        setResult(null);
        setLastAction('run');
        setActiveCaseTab(0);
        try {
            const res = await api.post<any>(`/submissions/${lesson.id}/run`, { code }, token || undefined);
            setRunOutput(res);
        } catch (err) {
            setRunOutput({ cases: [{ index: 1, input: '', stdout: '', stderr: 'Помилка виконання.', expected: '', passed: false, exitCode: 1 }] });
        } finally {
            setIsRunning(false);
        }
    };

    /** Submit — runs tests and calls Gemini AI only on failure. */
    const handleSubmitCode = async () => {
        setSubmitting(true);
        setRunOutput(null);
        setResult(null);
        setLastAction('submit');
        try {
            const res = await api.post<any>(`/submissions/${lesson.id}`, { code }, token || undefined);
            setResult(res);
        } catch (err) {
            setResult({ status: 'ERROR', output: 'Помилка при відправці. Перевірте зʼєднання.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkComplete = async (success?: any, score?: number, shouldRedirect = true) => {
        try {
            const isCompleted = success === true || success === undefined;
            const finalScore = score !== undefined ? Math.round(score) : undefined;

            await api.post(`/lessons/${lesson.id}/complete`, {
                completed: isCompleted,
                score: finalScore
            }, token || undefined);

            if (shouldRedirect) {
                if (courseSlug) {
                    router.push(`/dashboard/courses/${courseSlug}`);
                } else {
                    router.back();
                }
                router.refresh();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
    if (!lesson) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><Typography color="error">Урок не знайдено або ви не ввійшли.</Typography></Box>;

    return (
        <Box sx={{ bgcolor: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', color: '#fff', overflow: 'hidden' }}>
            {/* Premium IDE Header */}
            <Box sx={{
                height: 56,
                display: 'flex',
                alignItems: 'center',
                px: 2,
                bgcolor: '#0f172a',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                justifyContent: 'space-between',
                flexShrink: 0
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        onClick={() => router.back()}
                        sx={{
                            color: 'rgba(255,255,255,0.4)',
                            minWidth: 40,
                            height: 40,
                            borderRadius: '50%',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' }
                        }}
                    >
                        ‹
                    </Button>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, borderColor: 'rgba(255,255,255,0.1)' }} />

                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CodeIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', mr: 2 }}>Платформа</Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'rgba(255,255,255,0.4)' }}>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>{lesson.module?.course?.title || 'Курс'}</Typography>
                                <ChevronRightIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>{lesson.module?.title || 'Модуль'}</Typography>
                                <ChevronRightIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#3b82f6' }}>{lesson.title}</Typography>
                            </Box>
                        </Box>
                    )}

                    {isMobile && (
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem' }}>
                            {lesson.title}
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        px: 1.5, py: 0.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        display: 'flex', alignItems: 'center', gap: 1
                    }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                        <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 800, letterSpacing: 0.5 }}>
                            {lesson.difficulty || 'BASIC'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Content Logic */}
            {lesson.type === 'THEORY' ? (
                <TheoryView lesson={lesson} onComplete={handleMarkComplete} />
            ) : (
                <>
                    {/* Mobile Tabs Navigation */}
                    {isMobile && !isDifficultyLocked && lesson.type === 'PRACTICE' && (
                        <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', bgcolor: '#0f172a' }}>
                            <Tabs
                                value={activeTab}
                                onChange={(_, newValue) => setActiveTab(newValue)}
                                variant="fullWidth"
                                sx={{
                                    minHeight: 48,
                                    '& .MuiTab-root': {
                                        color: 'rgba(255,255,255,0.4)',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        minHeight: 48
                                    },
                                    '& .Mui-selected': { color: '#3b82f6 !important' },
                                    '& .MuiTabs-indicator': { bgcolor: '#3b82f6', height: 3, borderRadius: '3px 3px 0 0' }
                                }}
                            >
                                <Tab icon={<AssignmentIcon sx={{ fontSize: 20 }} />} label="Умова" />
                                <Tab icon={<CodeIcon sx={{ fontSize: 20 }} />} label="Код" />
                                <Tab icon={<TerminalIcon sx={{ fontSize: 20 }} />} label="Результат" />
                            </Tabs>
                        </Box>
                    )}

                    <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>
                        {/* Left Sidebar / Task Tab */}
                        {(!isMobile || activeTab === 0) && (
                            <Box sx={{
                                width: isMobile || lesson.type === 'QUIZ' ? '100%' : 500,
                                height: '100%',
                                borderRight: isMobile || lesson.type === 'QUIZ' ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                bgcolor: lesson.type === 'QUIZ' ? 'transparent' : '#0f172a',
                                flexShrink: 0,
                                overflowY: 'auto'
                            }}>
                                <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
                                    {isDifficultyLocked ? (
                                        <Box sx={{ pt: 10, textAlign: 'center' }}>
                                            <LockIcon sx={{ fontSize: 32, color: '#3b82f6', mb: 1.5 }} />
                                            <Typography variant="subtitle1" fontWeight="800">Рівень заблоковано</Typography>
                                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'rgba(255,255,255,0.4)', px: 3, fontSize: '0.75rem' }}>
                                                Пройдіть попередні завдання, щоб отримати доступ.
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                                                {lesson.module?.title || 'МОДУЛЬ 1'} • {lesson.difficulty || 'БАЗОВИЙ'}
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800, mt: 1, mb: 2, fontSize: '1.25rem' }}>
                                                {lesson.title}
                                            </Typography>

                                            {lesson.type !== 'QUIZ' && (
                                                <Box className="markdown-content" sx={{ mb: 4, '& p': { fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' } }}>
                                                    <ReactMarkdown>
                                                        {lesson.content}
                                                    </ReactMarkdown>
                                                </Box>
                                            )}

                                            {lesson.type === 'PRACTICE' && (
                                                <>
                                                    <Box sx={{
                                                        p: 2.5, borderRadius: 3,
                                                        bgcolor: 'rgba(59, 130, 246, 0.08)',
                                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                                        display: 'flex', gap: 2,
                                                        mt: 'auto'
                                                    }}>
                                                        <Box sx={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            width: 28, height: 28, borderRadius: '50%',
                                                            bgcolor: 'rgba(59, 130, 246, 0.2)', flexShrink: 0
                                                        }}>
                                                            <Typography sx={{ color: '#60a5fa', fontSize: 16, fontWeight: 900, fontFamily: 'serif', fontStyle: 'italic' }}>i</Typography>
                                                        </Box>
                                                        <Typography variant="caption" sx={{ color: '#93c5fd', fontWeight: 500, lineHeight: 1.5, fontSize: '0.8rem' }}>
                                                            Використовуйте стандартні потоки введення-виведення cin та cout для зчитування та виведення даних.
                                                        </Typography>
                                                    </Box>
                                                </>
                                            )}

                                            {lesson.type === 'QUIZ' && (
                                                <QuizView 
                                                    content={lesson.content} 
                                                    questions={lesson.testCases}
                                                    onComplete={handleMarkComplete} 
                                                />
                                            )}
                                        </motion.div>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* Main Content Area — Editor & Console */}
                        {(!isMobile || activeTab !== 0) && lesson.type !== 'QUIZ' && (
                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

                                {/* Editor Part */}
                                {(!isMobile || activeTab === 1) && (
                                    <Box sx={{
                                        flexGrow: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minHeight: isMobile ? '100%' : '60%',
                                        borderBottom: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'
                                    }}>
                                        {/* Editor toolbar */}
                                        <Box sx={{
                                            p: 1.5, px: 3,
                                            bgcolor: '#0f172a',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CodeIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }} />
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 1 }}>
                                                    SOLUTION.CPP
                                                </Typography>
                                            </Box>

                                            {/* Desktop: Run + Submit buttons */}
                                            {!isMobile && (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    {/* Run — no AI, just stdout */}
                                                    <Button
                                                        onClick={handleRunCode}
                                                        disabled={isRunning || submitting || isDifficultyLocked}
                                                        variant="outlined"
                                                        startIcon={isRunning ? <CircularProgress size={14} color="inherit" /> : <BugReportIcon sx={{ fontSize: 16 }} />}
                                                        sx={{
                                                            borderColor: 'rgba(255,255,255,0.15)',
                                                            color: 'rgba(255,255,255,0.7)',
                                                            '&:hover': { borderColor: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.05)' },
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            borderRadius: 1.5,
                                                            fontSize: '0.75rem',
                                                            px: 2,
                                                            py: 0.4
                                                        }}
                                                    >
                                                        {isRunning ? 'Виконання...' : 'Run'}
                                                    </Button>
                                                    {/* Submit — tests + Gemini hint */}
                                                    <Button
                                                        onClick={handleSubmitCode}
                                                        disabled={submitting || isRunning || isDifficultyLocked}
                                                        variant="contained"
                                                        startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
                                                        sx={{
                                                            bgcolor: '#3b82f6',
                                                            '&:hover': { bgcolor: '#2563eb' },
                                                            textTransform: 'none',
                                                            fontWeight: 800,
                                                            borderRadius: 1.5,
                                                            fontSize: '0.75rem',
                                                            px: 2,
                                                            py: 0.4
                                                        }}
                                                    >
                                                        {submitting ? 'Перевірка...' : 'Submit'}
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>

                                        <Box sx={{ flexGrow: 1, position: 'relative' }}>
                                            <Editor
                                                height="100%"
                                                defaultLanguage="cpp"
                                                theme="vs-dark"
                                                value={code}
                                                onChange={(v) => setCode(v || '')}
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: isMobile ? 14 : 15,
                                                    lineNumbers: 'on',
                                                    scrollBeyondLastLine: false,
                                                    padding: { top: 15 },
                                                    fontFamily: "'JetBrains Mono', monospace",
                                                    readOnly: isDifficultyLocked,
                                                    automaticLayout: true
                                                }}
                                            />

                                            {/* Mobile FABs — Run (small, grey) + Submit (blue) */}
                                            {isMobile && activeTab === 1 && (
                                                <Box sx={{ position: 'absolute', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                    <Fab
                                                        size="small"
                                                        onClick={() => { handleRunCode(); setActiveTab(2); }}
                                                        disabled={isRunning || submitting || isDifficultyLocked}
                                                        sx={{ bgcolor: '#334155', color: '#fff', '&:hover': { bgcolor: '#475569' } }}
                                                    >
                                                        {isRunning ? <CircularProgress size={20} color="inherit" /> : <BugReportIcon fontSize="small" />}
                                                    </Fab>
                                                    <Fab
                                                        onClick={() => { handleSubmitCode(); setActiveTab(2); }}
                                                        disabled={submitting || isRunning || isDifficultyLocked}
                                                        sx={{ bgcolor: '#3b82f6', color: '#fff', '&:hover': { bgcolor: '#2563eb' } }}
                                                    >
                                                        {submitting ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                                                    </Fab>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                )}

                                {/* Console / Results Panel */}
                                {(!isMobile || activeTab === 2) && (
                                    <Box sx={{
                                        height: isMobile ? '100%' : '40%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        bgcolor: '#020617',
                                        borderTop: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                                        overflowY: 'auto'
                                    }}>
                                        {/* Console header with mode badge */}
                                        <Box sx={{ p: 1.5, px: 3, bgcolor: '#0f172a', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: 1.5, fontSize: 9 }}>
                                                КОНСОЛЬ ВИВОДУ
                                            </Typography>
                                            {lastAction === 'run' && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                    <BugReportIcon sx={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
                                                    <Typography variant="caption" sx={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>RUN</Typography>
                                                </Box>
                                            )}
                                            {lastAction === 'submit' && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: 1, bgcolor: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                                                    <SendIcon sx={{ fontSize: 10, color: '#3b82f6' }} />
                                                    <Typography variant="caption" sx={{ fontSize: 9, color: '#3b82f6', fontWeight: 700 }}>SUBMIT</Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        <Box sx={{ p: 3, flexGrow: 1 }}>
                                            {/* ── Empty state ── */}
                                            {!lastAction && !isRunning && !submitting && (
                                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.1)', fontWeight: 700, fontSize: '0.8rem' }}>
                                                        Run — швидкий запуск · Submit — перевірка тестів
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* ── Loading states ── */}
                                            {(isRunning || submitting) && (
                                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                                                    <CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.3)' }} />
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '0.8rem' }}>
                                                        {isRunning ? 'Виконання...' : 'Перевірка тестів...'}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* ── RUN output — LeetCode-style case tabs ── */}
                                            {lastAction === 'run' && !isRunning && runOutput && (
                                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                                                    {/* Case tab pills */}
                                                    <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                                                        {runOutput.cases.map((c: any, i: number) => (
                                                            <Box
                                                                key={i}
                                                                onClick={() => setActiveCaseTab(i)}
                                                                sx={{
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1.5,
                                                                    px: 3,
                                                                    py: 1.5,
                                                                    borderRadius: 1.5,
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: 700,
                                                                    bgcolor: activeCaseTab === i
                                                                        ? (c.passed ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)')
                                                                        : 'rgba(255,255,255,0.05)',
                                                                    border: activeCaseTab === i
                                                                        ? `1px solid ${c.passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                                                                        : '1px solid transparent',
                                                                    color: activeCaseTab === i
                                                                        ? (c.passed ? '#10b981' : '#f87171')
                                                                        : 'rgba(255,255,255,0.5)',
                                                                    transition: 'all 0.15s',
                                                                }}
                                                            >
                                                                <Box sx={{
                                                                    width: 6, height: 6, borderRadius: '50%',
                                                                    bgcolor: c.passed ? '#10b981' : '#ef4444',
                                                                    flexShrink: 0
                                                                }} />
                                                                Case {c.index}
                                                            </Box>
                                                        ))}
                                                    </Box>

                                                    {/* Active case detail */}
                                                    {runOutput.cases[activeCaseTab] && (() => {
                                                        const c = runOutput.cases[activeCaseTab];
                                                        return (
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                                {/* Input */}
                                                                <Box>
                                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: 0.5 }}>Вхідні дані =</Typography>
                                                                    <Box sx={{ mt: 0.75, p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                        <Typography sx={{ color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                                                                            {c.input || '(порожньо)'}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>

                                                                {/* Expected (optional but helpful) */}
                                                                {!c.passed && c.expected && (
                                                                    <Box>
                                                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: 0.5 }}>Очікувано =</Typography>
                                                                        <Box sx={{ mt: 0.75, p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                                                                            <Typography sx={{ color: '#10b981', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                                                                                {c.expected}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>
                                                                )}

                                                                {/* Output */}
                                                                <Box>
                                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: 0.5 }}>Вивід =</Typography>
                                                                    <Box sx={{ mt: 0.75, p: 1.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                        {c.stderr && c.exitCode !== 0 ? (
                                                                            <Typography sx={{ color: '#f87171', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                                                                                {c.stderr}
                                                                            </Typography>
                                                                        ) : (
                                                                            <Typography sx={{ color: c.passed ? '#10b981' : '#f87171', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                                                                                {c.stdout || '(немає виводу)'}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        );
                                                    })()}
                                                </motion.div>
                                            )}

                                            {/* ── SUBMIT results (tests + AI hint) ── */}
                                            {lastAction === 'submit' && !submitting && result && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                                    {result.status === 'FAILED' && (
                                                        <Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef4444' }} />
                                                                <Typography sx={{ color: '#ef4444', fontWeight: 800, fontSize: '0.85rem' }}>
                                                                    Тест №{result.testResults?.find((r: any) => !r.passed)?.index || 1}: НЕ ПРОЙДЕНО
                                                                </Typography>
                                                            </Box>

                                                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                                                <Grid size={4}>
                                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>Вхідні дані:</Typography>
                                                                </Grid>
                                                                <Grid size={8}>
                                                                    <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#fff', fontWeight: 600 }}>
                                                                        {result.testResults?.find((r: any) => !r.passed)?.input || '—'}
                                                                    </Typography>
                                                                </Grid>

                                                                <Grid size={4}>
                                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>Очікувано:</Typography>
                                                                </Grid>
                                                                <Grid size={8}>
                                                                    <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#10b981', fontWeight: 800, wordBreak: 'break-all' }}>
                                                                        {result.expected || '—'}
                                                                    </Typography>
                                                                </Grid>

                                                                <Grid size={4}>
                                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>Отримано:</Typography>
                                                                </Grid>
                                                                <Grid size={8}>
                                                                    <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#ef4444', fontWeight: 800, wordBreak: 'break-all' }}>
                                                                        {result.actual || '—'}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>

                                                            <Box sx={{
                                                                p: 2, borderRadius: 2,
                                                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                                                borderLeft: '4px solid rgba(255, 255, 255, 0.1)',
                                                                display: 'flex', gap: 1.5, alignItems: 'flex-start'
                                                            }}>
                                                                <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: 18, mt: -0.5 }}>💡</Typography>
                                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: 1.5 }}>
                                                                    {result.hint || 'Порада: Спробуйте ще раз, звертаючи увагу на умову задачі.'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                    {result.status === 'PASSED' && (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 28 }} />
                                                                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#10b981' }}>Прийнято</Typography>
                                                            </Box>
                                                            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                                                                Усі {result.testResults?.length || ''} тестів пройдено успішно
                                                            </Typography>
                                                            <Button
                                                                onClick={() => handleMarkComplete(true)}
                                                                variant="contained"
                                                                fullWidth={isMobile}
                                                                sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, borderRadius: 2, px: 4, py: 1, fontWeight: 800, fontSize: '0.85rem', mt: 1 }}
                                                            >
                                                                ПРОДОВЖИТИ
                                                            </Button>
                                                        </Box>
                                                    )}
                                                    {result.status === 'ERROR' && (
                                                        <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                            <Typography sx={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                                                                {result.output}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </motion.div>
                                            )}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
}
