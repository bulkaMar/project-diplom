import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Button, Chip, CardActions } from '@mui/material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface CourseCardProps {
    course: {
        id: string;
        title: string;
        slug: string;
        description: string;
        progressPercent?: number;
        totalLessons?: number;
        completedLessons?: number;
        _count?: {
            modules: number;
        };
    };
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const router = useRouter();

    return (
        <motion.div
            whileHover={{ y: -8, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(134, 173, 255, 0.1)' }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{ height: '100%' }}
        >
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    overflow: 'hidden',
                    bgcolor: '#0b1325',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    position: 'relative',
                    backgroundImage: 'none'
                }}
            >
                <CardContent sx={{ flexGrow: 1, p: 3.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5, alignItems: 'center' }}>
                        <Chip 
                            label="C++" 
                            size="small" 
                            sx={{ 
                                bgcolor: 'rgba(134, 173, 255, 0.1)', 
                                color: '#86adff', 
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                letterSpacing: '0.05em',
                                border: '1px solid rgba(134, 173, 255, 0.2)'
                            }} 
                        />
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700, letterSpacing: '0.05em' }}>
                            {course._count?.modules || 0} МОДУЛІВ
                        </Typography>
                    </Box>
                    <Typography 
                        variant="h5" 
                        component="h2" 
                        sx={{ 
                            color: '#fff', 
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            mb: 2,
                            letterSpacing: '-0.02em',
                            fontSize: '1.4rem'
                        }}
                    >
                        {course.title}
                    </Typography>
                    <Typography variant="body2" sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        mb: 4,
                        lineHeight: 1.7,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '4.8em',
                        fontSize: '0.9rem'
                    }}>
                        {course.description}
                    </Typography>

                    <Box sx={{ mt: 'auto' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#86adff', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
                                ВАШ ПРОГРЕС
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem', fontFamily: "'Space Grotesk', sans-serif" }}>
                                {Math.round(course.progressPercent || 0)}%
                            </Typography>
                        </Box>
                        <Box sx={{ position: 'relative', height: 6, width: '100%', bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 3, overflow: 'hidden' }}>
                            <Box 
                                sx={{ 
                                    position: 'absolute',
                                    left: 0, top: 0, bottom: 0,
                                    width: `${course.progressPercent || 0}%`,
                                    background: 'linear-gradient(90deg, #86adff, #026fef)',
                                    borderRadius: 3,
                                    boxShadow: '0 0 10px rgba(134, 173, 255, 0.4)'
                                }} 
                            />
                        </Box>
                    </Box>
                </CardContent>
                <CardActions sx={{ p: 3.5, pt: 0 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => router.push(`/dashboard/courses/${course.slug}`)}
                        sx={{
                            bgcolor: '#3b82f6',
                            color: '#fff',
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 800,
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '1rem',
                            '&:hover': {
                                bgcolor: '#2563eb',
                                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {(course.progressPercent || 0) > 0 ? 'Продовжити' : 'Почати курс'}
                    </Button>
                </CardActions>
            </Card>
        </motion.div>
    );
};

export default CourseCard;
