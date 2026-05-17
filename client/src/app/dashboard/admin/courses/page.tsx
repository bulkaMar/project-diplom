'use client';

import React, { useEffect, useState } from 'react';
import { 
    Grid, Paper, Typography, Box, Button, Chip, CircularProgress, alpha,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert
} from '@mui/material';

// ... (rest of imports)

import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { 
    MenuBook as CourseIcon, 
    Layers as ModuleIcon, 
    PlayCircleOutline as LessonIcon,
    Add as AddIcon,
    DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminCourses() {
    const { token } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', slug: '', description: '' });
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: string, title: string }>({ open: false, id: '', title: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data);
        } catch (err) {
            console.error('Failed to fetch admin courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const transliterate = (text: string) => {
        const map: any = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z',
            'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
            'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
            'ь': '', 'ю': 'yu', 'я': 'ya', ' ': '-', '-': '-'
        };
        return text.toLowerCase().split('').map(char => map[char] || char).join('').replace(/[^a-z0-9-]/g, '');
    };

    const handleCreateCourse = async () => {
        try {
            const courseData = { ...newCourse, slug: transliterate(newCourse.title) };
            await axios.post(`${API_URL}/management/courses`, courseData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsCreateOpen(false);
            setNewCourse({ title: '', slug: '', description: '' });
            fetchCourses();
        } catch (err) {
            console.error('Failed to create course:', err);
        }
    };

    const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
        try {
            await axios.put(`${API_URL}/management/courses/${courseId}`, { 
                published: !currentStatus 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCourses();
        } catch (err) {
            console.error('Failed to toggle publish status:', err);
        }
    };

    const handleDeleteCourse = async () => {
        try {
            await axios.delete(`${API_URL}/management/courses/${confirmDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({ open: true, message: 'Курс успішно видалено', severity: 'success' });
            fetchCourses();
        } catch (err) {
            console.error('Failed to delete course:', err);
            setSnackbar({ open: true, message: 'Помилка при видаленні курсу', severity: 'error' });
        } finally {
            setConfirmDelete({ open: false, id: '', title: '' });
        }
    };

    useEffect(() => {
        if (token) fetchCourses();
    }, [token]);

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900 }}>
                    Доступні курси
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateOpen(true)}
                    sx={{ 
                        bgcolor: '#3b82f6', 
                        borderRadius: 3, 
                        px: 3, 
                        fontWeight: 800,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#2563eb' }
                    }}
                >
                    Створити курс
                </Button>
            </Box>

            {courses.map((course, index) => {
                const totalLessons = course.modules?.reduce((acc: number, m: any) => acc + (m._count?.lessons || 0), 0) || 0;

                return (
                    <Box key={course.id} sx={{ mb: 2, width: '100%' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Paper sx={{
                                p: 3,
                                bgcolor: '#161b26',
                                borderRadius: 4,
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: '#3b82f6',
                                    bgcolor: 'rgba(59, 130, 246, 0.02)'
                                }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Box sx={{
                                        width: 64, height: 64, borderRadius: 3,
                                        bgcolor: alpha('#3b82f6', 0.1),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#3b82f6'
                                    }}>
                                        <CourseIcon sx={{ fontSize: 32 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>
                                            {course.title}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <ModuleIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                                                    {course._count?.modules || 0} модулів
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <LessonIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                                                    {totalLessons} уроків
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Chip 
                                        label={course.published ? "ОПУБЛІКОВАНО" : "ЧЕРНЕТКА"} 
                                        size="small" 
                                        onClick={() => handleTogglePublish(course.id, course.published)}
                                        sx={{ 
                                            bgcolor: course.published ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                                            color: course.published ? '#10b981' : '#f59e0b',
                                            fontWeight: 800,
                                            fontSize: '0.7rem',
                                            borderRadius: 1.5,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: course.published ? alpha('#10b981', 0.2) : alpha('#f59e0b', 0.2),
                                                transform: 'scale(1.05)'
                                            }
                                        }} 
                                    />
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => setConfirmDelete({ open: true, id: course.id, title: course.title })}
                                        sx={{
                                            color: '#ef4444',
                                            borderColor: 'rgba(239, 68, 68, 0.2)',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            borderRadius: 2,
                                            minWidth: 0,
                                            p: 0.5,
                                            '&:hover': { 
                                                bgcolor: 'rgba(239, 68, 68, 0.05)',
                                                borderColor: '#ef4444'
                                            }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => router.push(`/dashboard/editor/groups`)}
                                        sx={{
                                            color: '#3b82f6',
                                            borderColor: 'rgba(59, 130, 246, 0.2)',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            borderRadius: 2,
                                            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.05)' }
                                        }}
                                    >
                                        Керувати групами
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => router.push(`/dashboard/editor/${course.id}`)}
                                        sx={{
                                            bgcolor: '#3b82f6',
                                            color: '#fff',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            borderRadius: 2,
                                            px: 2,
                                            '&:hover': { bgcolor: '#2563eb' }
                                        }}
                                    >
                                        Редагувати вміст
                                    </Button>
                                </Box>
                            </Paper>
                        </motion.div>
                    </Box>
                );
            })}

            {/* Create Course Dialog */}
            <Dialog 
                open={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)}
                PaperProps={{
                    sx: { bgcolor: '#0f172a', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.1)', width: '100%', maxWidth: 500 }
                }}
            >
                <DialogTitle sx={{ color: '#fff', fontWeight: 900 }}>Створити новий курс</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                        <TextField
                            label="Назва курсу"
                            fullWidth
                            value={newCourse.title}
                            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' }, '& label': { color: 'rgba(255,255,255,0.5)' } }}
                        />
                        <TextField
                            label="Опис"
                            fullWidth
                            multiline
                            rows={3}
                            value={newCourse.description}
                            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' }, '& label': { color: 'rgba(255,255,255,0.5)' } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsCreateOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>Скасувати</Button>
                    <Button variant="contained" onClick={handleCreateCourse} sx={{ bgcolor: '#3b82f6', borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}>Створити</Button>
                </DialogActions>
            </Dialog>
            {/* Delete Confirmation Dialog */}
            <Dialog 
                open={confirmDelete.open} 
                onClose={() => setConfirmDelete({ open: false, id: '', title: '' })}
                PaperProps={{
                    sx: { bgcolor: '#0f172a', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.1)', width: '100%', maxWidth: 400 }
                }}
            >
                <DialogTitle sx={{ color: '#fff', fontWeight: 900 }}>Видалити курс?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Ви впевнені, що хочете видалити курс <strong>{confirmDelete.title}</strong>? Цю дію неможливо скасувати.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setConfirmDelete({ open: false, id: '', title: '' })} sx={{ color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>Скасувати</Button>
                    <Button variant="contained" onClick={handleDeleteCourse} sx={{ bgcolor: '#ef4444', borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#dc2626' } }}>Видалити</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, fontWeight: 700 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
