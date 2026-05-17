'use client';

import React, { useEffect, useState } from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
    Typography, Box, MenuItem, Select, Chip, CircularProgress, Avatar, alpha,
    Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
    FormControl, InputLabel, Snackbar, Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminUsers() {
    const { token } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteData, setInviteData] = useState({ email: '', role: 'TEACHER' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchUsers();
    }, [token]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await axios.patch(`${API_URL}/admin/users/${userId}/role`, 
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error('Failed to update role:', err);
        }
    };

    const handleInvite = async () => {
        try {
            await axios.post(`${API_URL}/admin/users/invite`, inviteData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({ open: true, message: 'Запрошення надіслано успішно!', severity: 'success' });
            setIsInviteOpen(false);
            setInviteData({ email: '', role: 'TEACHER' });
            fetchUsers();
        } catch (err: any) {
            console.error('Failed to invite user:', err);
            setSnackbar({ 
                open: true, 
                message: err.response?.data?.message || 'Помилка при надсиланні запрошення', 
                severity: 'error' 
            });
        }
    };

    const roleMap: Record<string, string> = {
        'ADMIN': 'Адмін',
        'TEACHER': 'Викладач',
        'STUDENT': 'Студент',
        'APPLICANT': 'Абітурієнт'
    };

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900 }}>
                    Користувачі системи
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => setIsInviteOpen(true)}
                    sx={{ 
                        bgcolor: '#3b82f6', 
                        borderRadius: 3, 
                        px: 3, 
                        fontWeight: 800,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#2563eb' }
                    }}
                >
                    Запросити користувача
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ 
                bgcolor: '#161b26', 
                borderRadius: 4, 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: 'none',
                overflow: 'hidden'
            }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>Користувач</TableCell>
                            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>Email</TableCell>
                            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>Роль</TableCell>
                            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>Прогрес</TableCell>
                            <TableCell sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>Дата реєстрації</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.01)' } }}>
                                <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: user.role === 'ADMIN' ? '#fbbf24' : user.role === 'TEACHER' ? '#ec4899' : '#3b82f6', width: 32, height: 32, fontSize: '0.875rem' }}>
                                            {(user.name || user.email)[0].toUpperCase()}
                                        </Avatar>
                                        <Typography sx={{ color: '#fff', fontWeight: 600 }}>{user.name || 'Анонім'}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'rgba(255, 255, 255, 0.6)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    {user.email}
                                </TableCell>
                                <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <Select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        size="small"
                                        sx={{
                                            color: user.role === 'ADMIN' ? '#fbbf24' : user.role === 'TEACHER' ? '#ec4899' : '#fff',
                                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: 2,
                                            height: 32,
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' }
                                        }}
                                    >
                                        <MenuItem value="APPLICANT">{roleMap.APPLICANT}</MenuItem>
                                        <MenuItem value="STUDENT">{roleMap.STUDENT}</MenuItem>
                                        <MenuItem value="TEACHER">{roleMap.TEACHER}</MenuItem>
                                        <MenuItem value="ADMIN">{roleMap.ADMIN}</MenuItem>
                                    </Select>
                                </TableCell>
                                <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <Chip 
                                        label={`${user.progress?.length || 0} уроків`} 
                                        size="small" 
                                        sx={{ 
                                            bgcolor: alpha('#10b981', 0.1), 
                                            color: '#10b981', 
                                            fontWeight: 700,
                                            fontSize: '0.65rem'
                                        }} 
                                    />
                                </TableCell>
                                <TableCell sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Invite User Dialog */}
            <Dialog 
                open={isInviteOpen} 
                onClose={() => setIsInviteOpen(false)}
                PaperProps={{
                    sx: { bgcolor: '#0f172a', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.1)', width: '100%', maxWidth: 450 }
                }}
            >
                <DialogTitle sx={{ color: '#fff', fontWeight: 900 }}>Запросити нового користувача</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 3 }}>
                        Новий користувач отримає лист на електронну пошту з посиланням для створення акаунта та встановлення пароля.
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Email користувача"
                            fullWidth
                            type="email"
                            value={inviteData.email}
                            onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                            sx={{ 
                                '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)' }, 
                                '& label': { color: 'rgba(255,255,255,0.5)' } 
                            }}
                        />
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Роль</InputLabel>
                            <Select
                                value={inviteData.role}
                                label="Роль"
                                onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                                sx={{ 
                                    color: '#fff', 
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                <MenuItem value="STUDENT">Студент</MenuItem>
                                <MenuItem value="TEACHER">Викладач</MenuItem>
                                <MenuItem value="ADMIN">Адміністратор</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setIsInviteOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.5)', textTransform: 'none' }}>Скасувати</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleInvite} 
                        disabled={!inviteData.email}
                        sx={{ bgcolor: '#3b82f6', borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}
                    >
                        Надіслати запрошення
                    </Button>
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
        </motion.div>
    );
}
