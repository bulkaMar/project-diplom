'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Box, Container, Tab, Tabs, Typography } from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'ADMIN')) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || user.role !== 'ADMIN') {
        return null; // Or a loading spinner
    }

    const currentTab = pathname?.includes('/users') ? 1 : pathname?.includes('/courses') ? 2 : pathname?.includes('/reviews') ? 3 : 0;

    return (
        <Box sx={{ bgcolor: '#0b0f1a', minHeight: '100vh', pt: 4, pb: 8 }}>
            <Container maxWidth="xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mb: 1, letterSpacing: -1 }}>
                        Адмін-панель
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 4 }}>
                        Керування користувачами, курсами, відгуками та аналітика
                    </Typography>

                    <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.05)', mb: 4 }}>
                        <Tabs 
                            value={currentTab} 
                            sx={{
                                '& .MuiTab-root': {
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    minWidth: 120,
                                    '&.Mui-selected': { color: '#3b82f6' }
                                },
                                '& .MuiTabs-indicator': {
                                    bgcolor: '#3b82f6',
                                    height: 3,
                                    borderRadius: '3px 3px 0 0'
                                }
                            }}
                        >
                            <Tab label="Огляд" component={Link} href="/dashboard/admin" />
                            <Tab label="Користувачі" component={Link} href="/dashboard/admin/users" />
                            <Tab label="Курси" component={Link} href="/dashboard/admin/courses" />
                            <Tab label="Відгуки" component={Link} href="/dashboard/admin/reviews" />
                        </Tabs>
                    </Box>
                </motion.div>

                {children}
            </Container>
        </Box>
    );
}
