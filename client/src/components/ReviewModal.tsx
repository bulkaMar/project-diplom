'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Rating,
    TextField,
    IconButton,
    CircularProgress,
    alpha
} from '@mui/material';
import { Close as CloseIcon, Star as StarIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface CourseReviewModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    courseTitle: string;
}

const CourseReviewModal: React.FC<CourseReviewModalProps> = ({ open, onClose, onSubmit, courseTitle }) => {
    const [rating, setRating] = useState<number | null>(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!rating) return;
        setIsSubmitting(true);
        try {
            await onSubmit(rating, comment);
            onClose();
        } catch (error) {
            console.error('Failed to submit review:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: '#0a0a0c',
                    backgroundImage: 'none',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden'
                }
            }}
        >
            <Box sx={{ position: 'relative', pt: 4, pb: 3, px: 3, textAlign: 'center' }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        color: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                >
                    <Box sx={{
                        width: 60, height: 60, borderRadius: '50%',
                        bgcolor: alpha('#3b82f6', 0.1),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mx: 'auto', mb: 2, border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                        <StarIcon sx={{ color: '#3b82f6', fontSize: 30 }} />
                    </Box>
                </motion.div>

                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>
                    Поділіться враженнями!
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 3 }}>
                    Ви пройшли значну частину курсу "{courseTitle}". Як вам навчання?
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <Rating
                        value={rating}
                        onChange={(_, newValue) => setRating(newValue)}
                        icon={<StarIcon fontSize="large" sx={{ color: '#fbbf24', mx: 0.5 }} />}
                        emptyIcon={<StarIcon fontSize="large" sx={{ color: 'rgba(255, 255, 255, 0.1)', mx: 0.5 }} />}
                    />
                </Box>

                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Ваш відгук (необов'язково)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            color: '#fff',
                            borderRadius: 2,
                            fontSize: '0.9rem',
                            '& fieldset': { border: '1px solid rgba(255, 255, 255, 0.08)' },
                            '&:hover fieldset': { border: '1px solid rgba(255, 255, 255, 0.15)' },
                            '&.Mui-focused fieldset': { border: '1px solid #3b82f6' }
                        }
                    }}
                />

                <Button
                    fullWidth
                    variant="contained"
                    disabled={!rating || isSubmitting}
                    onClick={handleSubmit}
                    sx={{
                        mt: 4, py: 1.5,
                        borderRadius: 2,
                        bgcolor: '#3b82f6',
                        color: '#fff',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#2563eb' },
                        '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }
                    }}
                >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Надіслати відгук'}
                </Button>

                <Button
                    fullWidth
                    onClick={onClose}
                    sx={{
                        mt: 1, py: 1,
                        color: 'rgba(255, 255, 255, 0.3)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        '&:hover': { color: 'rgba(255, 255, 255, 0.5)', bgcolor: 'transparent' }
                    }}
                >
                    Можливо пізніше
                </Button>
            </Box>
        </Dialog>
    );
};

export default CourseReviewModal;
