'use client';

import React, { useEffect, useState } from 'react';
import { 
    Box, Grid, Paper, Typography, Button, TextField, Chip, alpha,
    CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, IconButton
} from '@mui/material';
import { 
    Group as GroupIcon, 
    Add as AddIcon,
    PersonAdd as PersonAddIcon,
    Link as LinkIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function GroupManagement() {
    const { token } = useAuth();
    const router = useRouter();
    
    const [groups, setGroups] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isLinkOpen, setIsLinkOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [groupName, setGroupName] = useState('');
    const [linkTarget, setLinkTarget] = useState<any>(null); // Course or User
    const [linkType, setLinkType] = useState<'user' | 'course'>('user');

    const fetchData = async () => {
        try {
            const [gRes, uRes, cRes] = await Promise.all([
                axios.get(`${API_URL}/management/groups`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/management/courses`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setGroups(gRes.data);
            setUsers(uRes.data);
            setCourses(cRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleCreateGroup = async () => {
        try {
            await axios.post(`${API_URL}/management/groups`, { name: groupName }, { headers: { Authorization: `Bearer ${token}` } });
            setIsCreateOpen(false);
            setGroupName('');
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleLinkToGroup = async () => {
        if (!selectedGroup || !linkTarget) return;
        try {
            const url = linkType === 'user' 
                ? `${API_URL}/management/groups/${selectedGroup.id}/users/${linkTarget.id}`
                : `${API_URL}/management/groups/${selectedGroup.id}/courses/${linkTarget.id}`;
            
            await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
            setIsLinkOpen(false);
            setLinkTarget(null);
            fetchData();
        } catch (err) { console.error(err); }
    };

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                <IconButton onClick={() => router.push('/dashboard/editor')} sx={{ color: '#fff' }}><BackIcon /></IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900 }}>Керування Групами</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>Організовуйте студентів та призначайте курси</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => setIsCreateOpen(true)}
                    sx={{ bgcolor: '#3b82f6', borderRadius: 3, px: 3, fontWeight: 800 }}
                >
                    Нова група
                </Button>
            </Box>

            <Grid container spacing={3}>
                {groups.map((group, index) => (
                    <Grid size={{ xs: 12, md: 6 }} key={group.id}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                            <Paper sx={{ p: 3, bgcolor: '#161b26', borderRadius: 4, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ width: 40, height: 40, bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <GroupIcon />
                                        </Box>
                                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>{group.name}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Студентів</Typography>
                                        <Typography sx={{ color: '#fff', fontWeight: 800 }}>{group._count.users}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>Курсів</Typography>
                                        <Typography sx={{ color: '#fff', fontWeight: 800 }}>{group._count.courses}</Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        startIcon={<PersonAddIcon />} 
                                        onClick={() => { setSelectedGroup(group); setLinkType('user'); setIsLinkOpen(true); }}
                                        sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 2, textTransform: 'none' }}
                                    >
                                        Студент
                                    </Button>
                                    <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        startIcon={<LinkIcon />} 
                                        onClick={() => { setSelectedGroup(group); setLinkType('course'); setIsLinkOpen(true); }}
                                        sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 2, textTransform: 'none' }}
                                    >
                                        Курс
                                    </Button>
                                </Box>
                            </Paper>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* Create Group Dialog */}
            <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} PaperProps={{ sx: { bgcolor: '#0f172a', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' } }}>
                <DialogTitle sx={{ color: '#fff' }}>Створити нову групу</DialogTitle>
                <DialogContent><TextField autoFocus fullWidth label="Назва групи" value={groupName} onChange={(e) => setGroupName(e.target.value)} sx={{ mt: 1, '& .MuiOutlinedInput-root': { color: '#fff' }, '& label': { color: 'rgba(255,255,255,0.5)' } }} /></DialogContent>
                <DialogActions sx={{ p: 3 }}><Button onClick={() => setIsCreateOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Скасувати</Button><Button onClick={handleCreateGroup} variant="contained" sx={{ bgcolor: '#3b82f6' }}>Створити</Button></DialogActions>
            </Dialog>

            {/* Link Dialog */}
            <Dialog open={isLinkOpen} onClose={() => setIsLinkOpen(false)} PaperProps={{ sx: { bgcolor: '#0f172a', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: 400 } }}>
                <DialogTitle sx={{ color: '#fff' }}>Додати {linkType === 'user' ? 'студента' : 'курс'} до {selectedGroup?.name}</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        options={linkType === 'user' ? users : courses}
                        getOptionLabel={(option: any) => linkType === 'user' ? `${option.name || option.email} (${option.email})` : option.title}
                        onChange={(_, val) => setLinkTarget(val)}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label={linkType === 'user' ? 'Оберіть студента' : 'Оберіть курс'} 
                                variant="outlined" 
                                sx={{ mt: 2, '& .MuiOutlinedInput-root': { color: '#fff' }, '& label': { color: 'rgba(255,255,255,0.5)' } }}
                            />
                        )}
                        sx={{ '& .MuiAutocomplete-paper': { bgcolor: '#161b26', color: '#fff' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setIsLinkOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Скасувати</Button>
                    <Button onClick={handleLinkToGroup} variant="contained" sx={{ bgcolor: '#3b82f6' }}>Додати</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
