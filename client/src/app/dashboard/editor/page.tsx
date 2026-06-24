'use client';

import React, { useEffect, useState } from 'react';
import { 
    Grid, Paper, Typography, Box, Button, Chip, CircularProgress, alpha,
    TextField, Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { 
    MenuBook as CourseIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Group as GroupIcon,
    DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EditorDashboard() {
    const { token, user } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', slug: '', description: '' });
    const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

    const handleDeleteCourse = async () => {
        if (!confirmDelete) return;
        try {
            await axios.delete(`${API_URL}/management/courses/${confirmDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConfirmDelete(null);
            fetchCourses();
        } catch (err) {
            console.error('Failed to delete course:', err);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${API_URL}/management/courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data);
        } catch (err) {
            console.error('Failed to fetch editor courses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && user?.role === 'ADMIN') {
            router.replace('/dashboard/admin/courses');
            return;
        }
        if (token) fetchCourses();
    }, [token, user, loading]);

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

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mb: 1 }}>
                        Редактор курсів
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Створюйте та редагуйте навчальний контент для ваших студентів.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsCreateOpen(true)}
                    sx={{
                        bgcolor: '#3b82f6',
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        fontWeight: 800,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#2563eb' }
                    }}
                >
                    Створити курс
                </Button>
            </Box>

            <Grid container spacing={3}>
                {courses.map((course, index) => (
                    <Grid size={{ xs: 12, md: 6 }} key={course.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Paper sx={{
                                p: 3,
                                bgcolor: '#161b26',
                                borderRadius: 4,
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.02)' }
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ 
                                        width: 48, height: 48, borderRadius: 2, 
                                        bgcolor: alpha('#3b82f6', 0.1),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#3b82f6'
                                    }}>
                                        <CourseIcon />
                                    </Box>
                                    <Chip 
                                        label={course.published ? "Опубліковано" : "Чернетка"} 
                                        size="small"
                                        sx={{ 
                                            bgcolor: course.published ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                                            color: course.published ? '#10b981' : '#f59e0b',
                                            fontWeight: 800,
                                            borderRadius: 1.5
                                        }}
                                    />
                                </Box>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>
                                    {course.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', mb: 3, height: 40, overflow: 'hidden' }}>
                                    {course.description || 'Немає опису'}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<EditIcon />}
                                        onClick={() => router.push(`/dashboard/editor/${course.id}`)}
                                        sx={{
                                            color: '#fff',
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            '&:hover': { borderColor: '#fff' }
                                        }}
                                    >
                                        Редагувати
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        title="Групи"
                                        sx={{
                                            minWidth: 48,
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: 2,
                                            '&:hover': { color: '#fff', borderColor: '#fff' }
                                        }}
                                    >
                                        <GroupIcon />
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        title="Видалити курс"
                                        onClick={() => setConfirmDelete({ id: course.id, title: course.title })}
                                        sx={{
                                            minWidth: 48,
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: 2,
                                            '&:hover': { color: '#ef4444', borderColor: '#ef4444', bgcolor: alpha('#ef4444', 0.05) }
                                        }}
                                    >
                                        <DeleteIcon />
                                    </Button>
                                </Box>
                            </Paper>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

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

            {/* Delete Course Confirmation Dialog */}
            <Dialog
                open={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                PaperProps={{
                    sx: { bgcolor: '#0f172a', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.1)', width: '100%', maxWidth: 460 }
                }}
            >
                <DialogTitle sx={{ color: '#fff', fontWeight: 900 }}>Видалити курс?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Ви впевнені, що хочете видалити курс <strong style={{ color: '#fff' }}>{confirmDelete?.title}</strong>? Усі модулі, уроки та відгуки буде видалено. Цю дію неможливо скасувати.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setConfirmDelete(null)} sx={{ color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>Скасувати</Button>
                    <Button variant="contained" onClick={handleDeleteCourse} sx={{ bgcolor: '#ef4444', borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#dc2626' } }}>Видалити</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
