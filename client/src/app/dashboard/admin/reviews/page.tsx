'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Grid, Paper, Typography, Box, Rating, Avatar, CircularProgress,
    TextField, Button, MenuItem, Stack, Alert, Divider
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminReviews() {
    const { token } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // ─────────── ТИМЧАСОВО: форма псевдо-відгуків ───────────
    const [courses, setCourses] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [courseId, setCourseId] = useState('');
    const [rating, setRating] = useState<number | null>(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    const fetchReviews = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/reviews`, authHeader);
            setReviews(res.data);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        if (!token) return;
        fetchReviews();
        axios.get(`${API_URL}/admin/courses`, authHeader)
            .then(res => setCourses(res.data))
            .catch(err => console.error('Failed to fetch courses:', err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleAddMock = async () => {
        if (!name.trim() || !courseId || !rating) {
            setFeedback({ type: 'error', text: 'Заповніть імʼя, курс та оцінку.' });
            return;
        }
        setSubmitting(true);
        setFeedback(null);
        try {
            await axios.post(`${API_URL}/admin/reviews/mock`,
                { name: name.trim(), courseId, rating, comment: comment.trim() },
                authHeader
            );
            setFeedback({ type: 'success', text: `Відгук від «${name.trim()}» додано.` });
            setName('');
            setComment('');
            setRating(5);
            await fetchReviews();
        } catch (err: any) {
            setFeedback({ type: 'error', text: err?.response?.data?.message || 'Не вдалося додати відгук.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAllMock = async () => {
        if (!confirm('Видалити ВСІ псевдо-відгуки (і псевдо-студентів)? Реальні відгуки не зачепить.')) return;
        try {
            const res = await axios.delete(`${API_URL}/admin/reviews/mock`, authHeader);
            setFeedback({ type: 'success', text: `Видалено псевдо-студентів: ${res.data.deletedUsers}.` });
            await fetchReviews();
        } catch (err: any) {
            setFeedback({ type: 'error', text: err?.response?.data?.message || 'Не вдалося видалити.' });
        }
    };
    // ────────────────────────────────────────────────────────

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

    const inputSx = {
        '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: '#0e121a' },
        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
    };

    return (
        <Box>
            {/* ─────────── ТИМЧАСОВА ФОРМА: видалити перед фіналом ─────────── */}
            <Paper sx={{
                p: 3, mb: 4, bgcolor: '#161b26', borderRadius: 4,
                border: '1px dashed rgba(251, 191, 36, 0.5)'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography sx={{ color: '#fbbf24', fontWeight: 800 }}>
                        🧪 Додати псевдо-відгук (тимчасово)
                    </Typography>
                    <Button size="small" color="error" onClick={handleDeleteAllMock}>
                        Видалити всі псевдо-відгуки
                    </Button>
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                    Відгук збережеться від імені нового псевдо-студента. Цей блок прибрати перед захистом.
                </Typography>

                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

                <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            label="Імʼя студента"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            size="small"
                            fullWidth
                            sx={inputSx}
                        />
                        <TextField
                            label="Курс"
                            select
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            size="small"
                            fullWidth
                            sx={inputSx}
                        >
                            {courses.length === 0 && (
                                <MenuItem disabled value="">Курсів не знайдено</MenuItem>
                            )}
                            {courses.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Оцінка:</Typography>
                        <Rating
                            value={rating}
                            onChange={(_, v) => setRating(v)}
                            sx={{ '& .MuiRating-iconFilled': { color: '#fbbf24' } }}
                        />
                    </Box>

                    <TextField
                        label="Коментар"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                        sx={inputSx}
                    />

                    {feedback && (
                        <Alert severity={feedback.type} sx={{ bgcolor: 'transparent' }}>
                            {feedback.text}
                        </Alert>
                    )}

                    <Box>
                        <Button
                            variant="contained"
                            onClick={handleAddMock}
                            disabled={submitting}
                            sx={{ bgcolor: '#3b82f6', fontWeight: 700, '&:hover': { bgcolor: '#2563eb' } }}
                        >
                            {submitting ? 'Додаю…' : 'Додати відгук'}
                        </Button>
                    </Box>
                </Stack>
            </Paper>
            {/* ─────────── /ТИМЧАСОВА ФОРМА ─────────── */}

            <Grid container spacing={3}>
                {reviews.length === 0 ? (
                    <Grid size={12}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', py: 8 }}>
                            Відгуків поки що немає.
                        </Typography>
                    </Grid>
                ) : (
                    reviews.map((review, index) => (
                        <Grid size={{ xs: 12, md: 6 }} key={review.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Paper sx={{
                                    p: 3,
                                    bgcolor: '#161b26',
                                    borderRadius: 4,
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    height: '100%'
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#3b82f6', width: 40, height: 40 }}>
                                                {(review.user?.name || review.user?.email || 'A')[0].toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ color: '#fff', fontWeight: 700 }}>
                                                    {review.user?.name || 'Анонім'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                                    {review.user?.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 800 }}>
                                            {review.course?.title}
                                        </Typography>
                                    </Box>

                                    <Rating
                                        value={review.rating}
                                        readOnly
                                        size="small"
                                        sx={{ mb: 1.5, '& .MuiRating-iconFilled': { color: '#fbbf24' } }}
                                    />

                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontStyle: review.comment ? 'normal' : 'italic' }}>
                                        {review.comment || 'Без текстового коментаря'}
                                    </Typography>

                                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                                            {new Date(review.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </motion.div>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
}
