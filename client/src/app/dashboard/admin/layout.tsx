'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Box, Container, Tab, Tabs, Typography } from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const tr = useT();
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
                        {tr('Адмін-панель', 'Admin panel')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 4 }}>
                        {tr('Керування користувачами, курсами, відгуками та аналітика', 'Manage users, courses, reviews and analytics')}
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
                            <Tab label={tr('Огляд', 'Overview')} component={Link} href="/dashboard/admin" />
                            <Tab label={tr('Користувачі', 'Users')} component={Link} href="/dashboard/admin/users" />
                            <Tab label={tr('Курси', 'Courses')} component={Link} href="/dashboard/admin/courses" />
                            <Tab label={tr('Відгуки', 'Reviews')} component={Link} href="/dashboard/admin/reviews" />
                        </Tabs>
                    </Box>
                </motion.div>

                {children}
            </Container>
        </Box>
    );
}
