'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import { Box } from '@mui/material';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Only hide navbar when deep inside the course editor studio
    // Pages like the editor dashboard and groups management should still have the navbar
    const isStudio = pathname.startsWith('/dashboard/editor/') && 
                    pathname !== '/dashboard/editor' && 
                    pathname !== '/dashboard/editor/groups';

    if (isStudio) {
        return (
            <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'hidden' }}>
                {children}
            </Box>
        );
    }

    const showFooter = pathname === '/' || pathname === '/login' || pathname === '/register';

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
            </Box>
            {showFooter && <Footer />}
        </Box>
    );
}
