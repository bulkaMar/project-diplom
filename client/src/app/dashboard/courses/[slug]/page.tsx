'use client';

import React, { useEffect, useState, use } from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails, LinearProgress, Chip, Paper, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CourseReviewModal from '@/components/ReviewModal';
import ModuleContent from '@/components/Course/ModuleContent';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import CodeIcon from '@mui/icons-material/Code';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CourseDetailPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
    const params = use(paramsPromise);
    const router = useRouter();
    const { token, isLoading: authLoading } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [canShowReviewButton, setCanShowReviewButton] = useState(false);

    useEffect(() => {
        const fetchCourseAndCheckReview = async () => {
            if (authLoading || !token) return;
            try {
                const response = await axios.get(`${API_URL}/courses/${params.slug}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const courseData = response.data;
                setCourse(courseData);

                // Calculate modules where at least one lesson is completed
                const completedCount = courseData.modules.filter((m: any) =>
                    m.lessons.some((l: any) => l.progress?.[0]?.completed)
                ).length;

                if (completedCount >= 3) {
                    // Check if already reviewed
                    try {
                        const reviewRes = await axios.get(`${API_URL}/reviews/${courseData.id}/mine`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (!reviewRes.data) {
                            setCanShowReviewButton(true);
                        }
                    } catch (e) {
                        console.error('Error checking review status', e);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseAndCheckReview();
    }, [params.slug, token, authLoading]);

    const handleReviewSubmit = async (rating: number, comment: string) => {
        if (!token || !course) return;
        try {
            await axios.post(`${API_URL}/reviews/${course.id}`,
                { rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCanShowReviewButton(false);
        } catch (err) {
            console.error('Error submitting review', err);
            throw err;
        }
    };

    if (loading || !course) {
        return <LinearProgress />;
    }

    const getIcon = (type: string, completed: boolean) => {
        if (completed) return <CheckCircleIcon color="success" />;
        switch (type) {
            case 'QUIZ': return <QuizIcon color="primary" />;
            case 'PRACTICE': return <CodeIcon color="primary" />;
            default: return <PlayCircleOutlineIcon color="primary" />;
        }
    };

    return (
        <Box sx={{ bgcolor: '#0b0f1a', minHeight: '100vh', py: 6 }}>
            <Container maxWidth="lg">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Paper sx={{
                        p: 4, mb: 6, borderRadius: 6,
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: 'white',
                        boxShadow: '0 20px 40px rgba(37, 99, 235, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h3" fontWeight="800" gutterBottom sx={{ letterSpacing: -0.5 }}>{course.title}</Typography>
                                <Typography variant="h6" sx={{ opacity: 0.8, mb: 4, fontWeight: 400, maxWidth: 600 }}>{course.description}</Typography>
                            </Box>
                            
                            {canShowReviewButton && (
                                <Button
                                    onClick={() => setShowReviewModal(true)}
                                    variant="contained"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        color: '#fff',
                                        fontWeight: 800,
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1,
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.3)',
                                        }
                                    }}
                                >
                                    Залишити відгук
                                </Button>
                            )}
                        </Box>

                        <Box sx={{ maxWidth: 450 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9 }}>Загальний прогрес</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{Math.round(course.progressPercent)}%</Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={course.progressPercent}
                                sx={{
                                    height: 8, borderRadius: 4,
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    '& .MuiLinearProgress-bar': { bgcolor: '#fff', borderRadius: 4 }
                                }}
                            />
                        </Box>
                    </Paper>

                    <Typography variant="h5" fontWeight="800" sx={{ mb: 4, color: '#fff', letterSpacing: -0.5 }}>Програма курсу</Typography>

                    {course.modules.map((module: any, index: number) => {
                        const isCompleted = module.lessons.every((l: any) => l.progress?.[0]?.completed);

                        return (
                            <Accordion
                                key={module.id}
                                defaultExpanded={index === 0}
                                sx={{
                                    mb: 3,
                                    bgcolor: '#161b26',
                                    borderRadius: '16px !important',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    color: '#fff',
                                    '&:before': { display: 'none' },
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { borderColor: 'rgba(37, 99, 235, 0.3)' }
                                }}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 700, mb: 0.5, display: 'block' }}>
                                                МОДУЛЬ {index + 1} • {module.lessons?.length || 0} ЗАВДАНЬ
                                            </Typography>
                                            <Typography variant="h6" fontWeight="800">{module.title}</Typography>
                                        </Box>
                                        {isCompleted && (
                                            <Chip
                                                label="ПРОЙДЕНО"
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                                                    color: '#10b981',
                                                    fontWeight: 800,
                                                    fontSize: '0.7rem',
                                                    borderRadius: 1.5
                                                }}
                                            />
                                        )}
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0, bgcolor: '#0f172a' }}>
                                    <ModuleContent moduleId={module.id} />
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </motion.div>
                
                {course && (
                    <CourseReviewModal
                        open={showReviewModal}
                        onClose={() => setShowReviewModal(false)}
                        onSubmit={handleReviewSubmit}
                        courseTitle={course.title}
                    />
                )}
            </Container>
        </Box>
    );
}
