'use client';

import React, { useEffect, useState } from 'react';
import { 
    Grid, Paper, Typography, Box, Rating, Avatar, CircularProgress, alpha 
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminReviews() {
    const { token } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/reviews`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReviews(res.data);
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchReviews();
    }, [token]);

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

    return (
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
    );
}
